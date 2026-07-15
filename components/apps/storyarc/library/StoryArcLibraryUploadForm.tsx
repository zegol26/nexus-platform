"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { STORYARC_LIBRARY_MAX_FILE_BYTES } from "@/lib/storyarc/library/policy";

type ClassroomOption = { id: string; label: string };

export function StoryArcLibraryUploadForm({ classes }: { classes: ClassroomOption[] }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedFile = formData.get("file");

    if (!(selectedFile instanceof File) || selectedFile.size === 0) {
      setStatus("error");
      setMessage("Choose a PDF document.");
      return;
    }
    if (selectedFile.size > STORYARC_LIBRARY_MAX_FILE_BYTES) {
      setStatus("error");
      setMessage("The PDF must be 50 MB or smaller.");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".pdf") || selectedFile.type !== "application/pdf") {
      setStatus("error");
      setMessage("New Digital Library uploads must be PDF files.");
      return;
    }

    setStatus("uploading");
    setMessage("Authorizing secure private upload...");
    try {
      const authorizationResponse = await fetch("/api/apps/storyarc/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: String(formData.get("classId") ?? ""),
          subject: String(formData.get("subject") ?? ""),
          title: String(formData.get("title") ?? ""),
          summary: String(formData.get("summary") ?? ""),
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
        }),
      });
      const authorization = await authorizationResponse.json() as {
        error?: string;
        intentId?: string;
        pathname?: string;
        uploadUrl?: string;
      };
      if (!authorizationResponse.ok || !authorization.intentId || !authorization.pathname || !authorization.uploadUrl) {
        throw new Error(authorization.error ?? "Document upload authorization failed.");
      }

      setMessage("Uploading PDF directly to private storage...");
      const blobResponse = await fetch(authorization.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/pdf" },
        body: selectedFile,
      });
      if (!blobResponse.ok) throw new Error("Private storage rejected the PDF upload.");

      setMessage("Validating and publishing document metadata...");
      const completionResponse = await fetch("/api/apps/storyarc/library/upload-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentId: authorization.intentId, pathname: authorization.pathname }),
      });
      const completion = await completionResponse.json() as { error?: string };
      if (!completionResponse.ok) throw new Error(completion.error ?? "Document finalization failed.");

      form.reset();
      setStatus("success");
      setMessage("Document added to the class library.");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Document upload failed.");
    }
  }

  const inputClass = "rounded-xl border border-white/10 bg-[#101b42] px-3 py-3 text-sm text-white outline-none focus:border-cyan-300";
  return (
    <form onSubmit={submit} className="storyarc-control-card grid gap-3">
      <div>
        <p className="storyarc-eyebrow">TEACHER UPLOAD</p>
        <h2>Add library document</h2>
        <p>Share a private PDF with one class. The file uploads directly to secure storage.</p>
      </div>
      <label className="grid gap-1 text-xs font-bold text-slate-300">
        Class
        <select name="classId" className={inputClass} required>
          <option value="">Choose class</option>
          {classes.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.label}</option>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-bold text-slate-300">
          Subject
          <input name="subject" className={inputClass} placeholder="English, Mathematics..." minLength={2} maxLength={80} required />
        </label>
        <label className="grid gap-1 text-xs font-bold text-slate-300">
          Document title
          <input name="title" className={inputClass} placeholder="Week 3 reading guide" minLength={3} maxLength={120} required />
        </label>
      </div>
      <label className="grid gap-1 text-xs font-bold text-slate-300">
        Teacher summary
        <textarea name="summary" className={`${inputClass} min-h-28 resize-y`} placeholder="Explain what students will learn and how to use this document." minLength={10} maxLength={2000} required />
      </label>
      <label className="grid gap-1 text-xs font-bold text-slate-300">
        Document file
        <input
          name="file"
          type="file"
          accept=".pdf,application/pdf"
          className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-300 file:px-3 file:py-2 file:font-black file:text-cyan-950`}
          required
        />
        <small className="font-normal text-slate-500">PDF only · maximum 50 MB</small>
      </label>
      <button disabled={status === "uploading" || classes.length === 0} className="storyarc-primary-button disabled:cursor-not-allowed disabled:opacity-50">
        {status === "uploading" ? "Uploading..." : "Publish to class library"}
      </button>
      {message ? <p role="status" className={`text-sm ${status === "error" ? "text-amber-300" : "text-emerald-300"}`}>{message}</p> : null}
    </form>
  );
}
