# StoryArc Indonesian School, Pose, Voice, and Learn Runtime v3

Date: 2026-07-15

## Shipped behavior

- The gate, corridor, canteen, assembly hall, and club room now use original Indonesian-school environments. The gate includes tropical campus architecture and the Indonesian flag; interiors use local architectural and decorative cues.
- Hana, Maya, and Sari are secondary-school learners in modest uniforms and hijab. Ibu Ratna was regenerated as a distinct adult principal.
- The previous pseudo-rig duplicated the same transparent image into body, torso, and head clips. It was removed because chroma residue and imperfect alignment produced ghost faces and colored fringes. Runtime now switches between genuine full-body pose assets according to character, expression state, and dialogue node.
- StoryArc speakers now use dedicated voice profiles through one OpenAI-first generation path. StoryArc pins the configured snapshot (default `gpt-4o-mini-tts-2025-12-15`) so a character does not alternate between providers or silently inherit a shared generic voice.
- StoryArc speech is requested as PCM WAV and normalized to a shared RMS target with a peak ceiling before it is cached. The cache key fingerprints the model, voice, instructions, and normalization version, so older mixed-provider or differently voiced audio is not reused.
- Owner-approved teenage pitch mitigation applies only to student profiles: female students use a `1.11` sample-rate multiplier and male students use `1.08`. Adult mentors, teachers, the principal, and narrator remain unshifted. Student cache fingerprints use `storyarc-voice-v5-teen-pitch`, forcing regeneration without deleting historical cache rows.
- School Core A/B transcripts are split into sequential dialogue turns. Speaker A and Speaker B use separate, stable student profiles instead of sending the entire transcript through the adult narrator profile.
- Published School Core cards now open an interactive lesson runtime with objectives, warm-up responses, language patterns, listening playback and transcript, guided practice with rationale, production prompts, story links, and mastery checks.

## Asset generation and processing

- Source art: OpenAI built-in image generation; all shipped artwork is newly generated original work.
- Character sheets used a flat chroma background and were processed through the Codex imagegen chroma-key helper with soft matte, edge contraction, and spill cleanup.
- Runtime files use WebP. SHA-256 hashes and byte sizes are recorded in `public/storyarc/asset-manifest.json`.

## Voice identity map

- Hana: youthful female student, `coral` fallback.
- Ryo: calm young male student, `ash` fallback.
- Maya: bright young female student, `shimmer` fallback.
- Sari: expressive young female student, `nova` fallback.
- John: young adult mentor, `verse` fallback.
- Ibu Ratna: mature principal, `marin` fallback.
- Pak Halim: adult teacher, `cedar` fallback.
- Narrator: neutral adult narrator, `sage` fallback.
- Lesson Speaker A: youthful male student, `ash` fallback.
- Lesson Speaker B: youthful female student, `coral` fallback.

These voices use fixed identity instructions and a pinned StoryArc TTS snapshot. The UI retains explicit playback controls and transcript visibility. The teenage pitch adjustment was approved by the product owner on 2026-07-15; this runtime approval does not represent final academic, accessibility, or production-audio sign-off.
