"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Recorder } from "@/components/Recorder";
import { uploadAudio } from "@/lib/upload";
import { ERROR_TAGS } from "@/lib/site";
import type { Task } from "@/lib/types";

export function TaskEditor({ task, languageName, userId, agreementSigned, nextId }: {
  task: Task; languageName: string; userId: string; agreementSigned: boolean; nextId: string | null;
}) {
  const mine = task.claimed_by === userId;
  const done = ["submitted", "approved", "rejected"].includes(task.status);
  const [text, setText] = useState(task.corrected_text ?? task.ai_draft ?? "");
  const [tags, setTags] = useState<string[]>(task.error_tags ?? []);
  const [note, setNote] = useState(task.contributor_note ?? "");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  if (done) {
    return (
      <div className="mt-6 card p-5">
        <p className="label">Status: {task.status}</p>
        <p className="mt-2 word text-xl">{task.corrected_text}</p>
        {task.review_note && <p className="mt-2 text-sm text-muted">Reviewer: {task.review_note}</p>}
        {nextId && <Link href={`/tasks/${nextId}`} className="btn btn-primary mt-4">Next task →</Link>}
      </div>
    );
  }
  if (task.claimed_by && !mine) return <p className="mt-6 card p-5 text-muted">Someone else is working on this task.</p>;

  const toggle = (id: string) =>
    setTags((t) => (id === "ok" ? (t.includes("ok") ? [] : ["ok"]) : t.includes(id) ? t.filter((x) => x !== id) : [...t.filter((x) => x !== "ok"), id]));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreementSigned) { setMsg("Accept the contribution agreement on your account page first."); return; }
    if (!text.trim()) { setMsg("Write the corrected sentence."); return; }
    if (!tags.length) { setMsg("Tick at least one box: what did the AI get wrong (or was it correct)?"); return; }
    if (!blob) { setMsg("Record yourself reading the corrected sentence."); return; }
    setBusy(true); setMsg(null);
    const supabase = createClient();
    if (!task.claimed_by) {
      const { error } = await supabase.from("tasks").update({ status: "claimed", claimed_by: userId, claimed_at: new Date().toISOString() }).eq("id", task.id).eq("status", "open");
      if (error) { setMsg(error.message); setBusy(false); return; }
    }
    const audio = await uploadAudio(supabase, userId, blob, { concept_id: task.concept_id, language: task.target_language });
    if (audio.error) { setMsg(audio.error); setBusy(false); return; }
    const { error } = await supabase.from("tasks").update({
      corrected_text: text.trim().normalize("NFC"), error_tags: tags, contributor_note: note || null,
      audio_media_id: audio.id, status: "submitted", submitted_at: new Date().toISOString(), claimed_by: userId,
    }).eq("id", task.id);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    router.push(nextId ? `/tasks/${nextId}` : "/tasks");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-6">
      {task.ai_draft && (
        <div>
          <p className="label">AI draft ({task.ai_engine})</p>
          <p className="mt-1 word text-xl text-ink/70 line-through decoration-clay/40 decoration-1">{task.ai_draft}</p>
        </div>
      )}
      <label className="grid gap-1.5">
        <span className="label">Your {languageName}, as a native speaker would say it</span>
        <textarea className="input word !text-xl min-h-28" value={text} onChange={(e) => setText(e.target.value)} />
        <span className="text-xs text-muted">Use full tone marks and special letters. Keep it natural, not word-for-word.</span>
      </label>

      <fieldset>
        <legend className="label mb-2">What did the AI get wrong?</legend>
        <div className="flex flex-wrap gap-2">
          {ERROR_TAGS.map((t) => (
            <button type="button" key={t.id} title={t.hint} onClick={() => toggle(t.id)}
              className={`btn !py-1.5 text-sm ${tags.includes(t.id) ? (t.id === "ok" ? "bg-leaf text-white" : "btn-clay") : "btn-ghost"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <span className="label">Read your sentence aloud</span>
        <Recorder onReady={setBlob} />
        <span className="text-xs text-muted">Quiet room, phone about a hand&apos;s width from your mouth.</span>
      </div>

      <label className="grid gap-1.5">
        <span className="label">Note for the reviewer (optional)</span>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Kano usage; in Sokoto people say …" />
      </label>

      {msg && <p className="text-clay text-sm">{msg}</p>}
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="btn btn-primary">{busy ? "Sending…" : "Submit for review"}</button>
        {nextId && <Link href={`/tasks/${nextId}`} className="btn btn-ghost">Skip</Link>}
      </div>
    </form>
  );
}
