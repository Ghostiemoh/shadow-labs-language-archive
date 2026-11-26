"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Recorder } from "./Recorder";
import { uploadAudio } from "@/lib/upload";

// Lets a signed-in speaker suggest a name (with optional dialect) and/or record an existing one.
export function AddName({ conceptId, language, languageName, signedIn, lexemes }: {
  conceptId: string; language: string; languageName: string; signedIn: boolean; lexemes: { id: string; form: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState("");
  const [dialect, setDialect] = useState("");
  const [target, setTarget] = useState<string>(lexemes[0]?.id ?? "new");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  if (!signedIn)
    return <Link href="/login" className="mt-3 inline-block text-sm text-indigo">Speak {languageName}? Sign in to add a name or record it →</Link>;
  if (!open)
    return <button onClick={() => setOpen(true)} className="mt-3 text-sm text-indigo font-semibold">+ Add a name or record it</button>;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMsg("Please sign in again."); setBusy(false); return; }
    let lexemeId = target === "new" ? null : target;
    if (target === "new") {
      if (!form.trim()) { setMsg("Type the name first."); setBusy(false); return; }
      const { data, error } = await supabase.from("lexemes").insert({
        concept_id: conceptId, language, form: form.trim().normalize("NFC"), dialect: dialect.trim() || null,
        source: "contributor", status: "pending", contributor_id: user.id,
      }).select("id").single();
      if (error) { setMsg(error.message); setBusy(false); return; }
      lexemeId = data.id;
    }
    if (blob && lexemeId) {
      const res = await uploadAudio(supabase, user.id, blob, { concept_id: conceptId, lexeme_id: lexemeId, language });
      if (res.error) { setMsg(res.error); setBusy(false); return; }
    }
    setBusy(false); setOpen(false); setForm(""); setDialect(""); setBlob(null);
    setMsg(null);
    router.refresh();
    alert("Thank you. A reviewer for " + languageName + " will check it.");
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-3 border-t border-line pt-4">
      {lexemes.length > 0 && (
        <label className="grid gap-1">
          <span className="label">What are you adding?</span>
          <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
            {lexemes.map((l) => <option key={l.id} value={l.id}>A recording of “{l.form}”</option>)}
            <option value="new">A different or better name</option>
          </select>
        </label>
      )}
      {target === "new" && (
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="label">{languageName} name, with tone marks</span>
            <input className="input word text-lg" value={form} onChange={(e) => setForm(e.target.value)} placeholder="e.g. ewúrẹ́" />
          </label>
          <label className="grid gap-1">
            <span className="label">Dialect / area (optional)</span>
            <input className="input" value={dialect} onChange={(e) => setDialect(e.target.value)} placeholder="e.g. Kano, Ọ̀yọ́, Onitsha" />
          </label>
        </div>
      )}
      <div className="grid gap-1">
        <span className="label">Your voice (optional)</span>
        <Recorder onReady={setBlob} />
      </div>
      {msg && <p className="text-sm text-clay">{msg}</p>}
      <div className="flex gap-2">
        <button disabled={busy} className="btn btn-primary">{busy ? "Saving…" : "Send for review"}</button>
        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
      </div>
      <p className="text-xs text-muted">By sending, you agree your recording and text can be published and licensed under the contribution agreement.</p>
    </form>
  );
}
