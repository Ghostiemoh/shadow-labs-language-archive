"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Language, Profile } from "@/lib/types";
import { AGREEMENT } from "@/lib/agreement";

export function ProfileForm({ profile, languages }: { profile: Profile; languages: Language[] }) {
  const [name, setName] = useState(profile.display_name ?? "");
  const [langs, setLangs] = useState<string[]>(profile.languages);
  const [agree, setAgree] = useState(!!profile.agreement_signed_at);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      display_name: name, languages: langs,
      agreement_signed_at: agree ? profile.agreement_signed_at ?? new Date().toISOString() : null,
    }).eq("id", profile.id);
    setMsg(error ? error.message : "Saved.");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="card p-5 grid gap-5">
      <label className="grid gap-1"><span className="label">Display name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} /></label>
      <fieldset className="grid gap-2">
        <legend className="label mb-1">Languages you speak natively</legend>
        <div className="flex flex-wrap gap-2">
          {languages.map((l) => (
            <label key={l.code} className={`btn !py-1 cursor-pointer ${langs.includes(l.code) ? "btn-primary" : "btn-ghost"}`}>
              <input type="checkbox" className="sr-only" checked={langs.includes(l.code)}
                onChange={(e) => setLangs(e.target.checked ? [...langs, l.code] : langs.filter((x) => x !== l.code))} />
              {l.name}{!l.active && " (soon)"}
            </label>
          ))}
        </div>
      </fieldset>
      <details className="rounded-lg border border-line p-4 bg-sand/60" open={!profile.agreement_signed_at}>
        <summary className="font-semibold cursor-pointer">Contribution agreement (v1)</summary>
        <div className="mt-3 text-sm leading-relaxed text-ink/80 whitespace-pre-line">{AGREEMENT}</div>
      </details>
      <label className="flex gap-3 items-start">
        <input type="checkbox" className="mt-1 size-4" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
        <span className="text-sm">I have read and accept the contribution agreement.</span>
      </label>
      {msg && <p className="text-sm text-leaf">{msg}</p>}
      <button className="btn btn-primary justify-self-start">Save</button>
    </form>
  );
}
