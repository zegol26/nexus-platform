import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as lame from "@breezystack/lamejs";

const generator = "Microsoft Speech API";
const voice = "Microsoft David Desktop";
const dataDirectory = path.join(process.cwd(), "prisma", "data", "storyarc");
const outputDirectory = path.join(process.cwd(), "public", "storyarc", "audio");
const packageFiles = (await readdir(dataDirectory)).filter((file) => file.endsWith(".json")).sort();
const packages = await Promise.all(packageFiles.map(async (file) => ({
  file,
  value: JSON.parse(await readFile(path.join(dataDirectory, file), "utf8")),
})));

function collectTranscripts(value, key = "") {
  if (Array.isArray(value)) return value.flatMap((entry) => collectTranscripts(entry, key));
  if (!value || typeof value !== "object") return [];

  const found = [];
  for (const [childKey, childValue] of Object.entries(value)) {
    if (typeof childValue === "string" && /(transcript|script).*En$/i.test(childKey)) found.push(childValue.trim());
    else found.push(...collectTranscripts(childValue, childKey));
  }
  return found.filter(Boolean);
}

function identifier(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

const jobs = [];
for (const pkg of packages) {
  for (const item of pkg.value.items) {
    let listeningIndex = 0;
    for (const block of item.content.lessonBlocks) {
      if (typeof block.audioState !== "string" || !block.audioState.includes("pending-audio")) continue;
      listeningIndex += 1;
      const transcripts = [...new Set(collectTranscripts(block))];
      if (transcripts.length === 0) throw new Error(`${item.stableId} has pending audio without a transcript`);
      const blockKey = block.sectionId ?? `${block.blockType}-${listeningIndex}`;
      jobs.push({
        pkg,
        item,
        block,
        transcript: transcripts.join("\n\n"),
        assetId: identifier(`audio-${item.stableId}-${blockKey}-v1`),
        blockKey,
      });
    }
  }
}

if (jobs.length === 0) {
  console.log(JSON.stringify({ generated: 0, message: "No pending StoryArc audio blocks found." }, null, 2));
  process.exit(0);
}

await mkdir(outputDirectory, { recursive: true });
const generated = [];

function encodeWaveToMp3(wave) {
  if (wave.toString("ascii", 0, 4) !== "RIFF" || wave.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Local speech output is not a RIFF/WAVE file");
  }
  let offset = 12;
  let channels = 0;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let dataOffset = 0;
  let dataSize = 0;
  while (offset + 8 <= wave.length) {
    const chunkId = wave.toString("ascii", offset, offset + 4);
    const chunkSize = wave.readUInt32LE(offset + 4);
    if (chunkId === "fmt ") {
      const audioFormat = wave.readUInt16LE(offset + 8);
      if (audioFormat !== 1) throw new Error(`Unsupported WAV format ${audioFormat}`);
      channels = wave.readUInt16LE(offset + 10);
      sampleRate = wave.readUInt32LE(offset + 12);
      bitsPerSample = wave.readUInt16LE(offset + 22);
    }
    if (chunkId === "data") {
      dataOffset = offset + 8;
      dataSize = chunkSize;
      break;
    }
    offset += 8 + chunkSize + (chunkSize % 2);
  }
  if (channels !== 1 || bitsPerSample !== 16 || !dataOffset || !dataSize) {
    throw new Error(`Expected mono 16-bit PCM WAV, got channels=${channels}, bits=${bitsPerSample}`);
  }
  const samples = new Int16Array(wave.buffer, wave.byteOffset + dataOffset, Math.floor(dataSize / 2));
  const encoder = new lame.Mp3Encoder(1, sampleRate, 96);
  const mp3Chunks = [];
  for (let sampleOffset = 0; sampleOffset < samples.length; sampleOffset += 1152) {
    const encoded = encoder.encodeBuffer(samples.subarray(sampleOffset, sampleOffset + 1152));
    if (encoded.length > 0) mp3Chunks.push(Buffer.from(encoded));
  }
  const flushed = encoder.flush();
  if (flushed.length > 0) mp3Chunks.push(Buffer.from(flushed));
  return Buffer.concat(mp3Chunks);
}

for (const [index, job] of jobs.entries()) {
  console.log(`[${index + 1}/${jobs.length}] ${job.item.stableId}/${job.blockKey}`);
  const tempBase = path.join(os.tmpdir(), job.assetId);
  const transcriptPath = `${tempBase}.txt`;
  const wavePath = `${tempBase}.wav`;
  await writeFile(transcriptPath, job.transcript, "utf8");
  const speech = spawnSync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy", "Bypass",
    "-File", path.join(process.cwd(), "scripts", "synthesize-storyarc-audio.ps1"),
    "-InputPath", transcriptPath,
    "-OutputPath", wavePath,
    "-Voice", voice,
  ], { encoding: "utf8" });
  await unlink(transcriptPath).catch(() => undefined);
  if (speech.status !== 0) throw new Error(`Local TTS failed for ${job.assetId}: ${speech.stderr || speech.stdout}`);
  const wave = await readFile(wavePath);
  await unlink(wavePath).catch(() => undefined);
  const buffer = encodeWaveToMp3(wave);
  if (buffer.byteLength === 0) throw new Error(`Empty audio response for ${job.assetId}`);
  const hash = createHash("sha256").update(buffer).digest("hex");
  const fileName = `${hash}.mp3`;
  await writeFile(path.join(outputDirectory, fileName), buffer);
  generated.push({ ...job, buffer, hash, fileName });
}

for (const result of generated) {
  const existingIndex = result.pkg.value.assets.findIndex((asset) => asset.assetId === result.assetId);
  const asset = {
    assetId: result.assetId,
    revision: 1,
    type: "AUDIO_MP3",
    purpose: `English learning and assessment audio for ${result.item.stableId}/${result.blockKey}`,
    sourceType: "generated",
    sourceReference: `approved-transcript://${result.item.stableId}/${result.blockKey}`,
    authorOrGenerator: `${generator}, voice ${voice}, encoded with @breezystack/lamejs`,
    license: "NEXUS-GENERATED-OUTPUT",
    commercialUseAllowed: true,
    derivativeUseAllowed: true,
    attributionRequired: false,
    rightsOwner: "Nexus Talenta Indonesia Academy",
    approvalStatus: "TEMPORARY_APPROVED",
    storageLocation: `/storyarc/audio/${result.fileName}`,
    contentHash: `sha256:${result.hash}`,
    mimeType: "audio/mpeg",
    byteSize: result.buffer.byteLength,
    temporary: true,
  };
  if (existingIndex >= 0) result.pkg.value.assets[existingIndex] = asset;
  else result.pkg.value.assets.push(asset);
  result.block.audioState = "generated-audio-temporary-approved";
  result.block.audioAssetId = result.assetId;
  result.block.audioDisclosureId = "Suara ini dibuat oleh AI dan menunggu persetujuan final editor akademik.";
}

for (const pkg of packages) {
  await writeFile(path.join(dataDirectory, pkg.file), `${JSON.stringify(pkg.value, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify({
  generated: generated.length,
  totalBytes: generated.reduce((sum, result) => sum + result.buffer.byteLength, 0),
  generator,
  voice,
  assets: generated.map((result) => ({
    assetId: result.assetId,
    itemId: result.item.stableId,
    blockKey: result.blockKey,
    contentHash: `sha256:${result.hash}`,
    byteSize: result.buffer.byteLength,
    storageLocation: `/storyarc/audio/${result.fileName}`,
  })),
}, null, 2));
