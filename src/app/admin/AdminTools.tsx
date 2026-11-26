"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Collection, Language, Profile } from "@/lib/types";

const box = "card p-5";
const h2 = "display text-[length:var(--step-1)]";

export function People({ people, languages }: { people: Profile[]; languages: Language[] }) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  async function update(id: string, patch: Partial<Profile>) {
    const { error } = await createClient().from("profiles").update(patch).eq("id", id);
    setErr(error?.message ?? null);
    router.refresh();
  }
  return (
    <section className={box}>
      <h2 className={h2}>People and roles</h2>
      <p className="text-sm text-muted mt-1">Make language leads reviewers and tick the languages they review.</p>
      {err && <p className="text-clay text-sm mt-2">{err}</p>}
      <div className="mt-4 grid gap-2">
        {people.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-3 border-b border-line pb-2">
            <span className="font-semibold min-w-36">{p.display_name}</span>
            <select className="input !w-auto !py-1" value={p.role} onChange={(e) => update(p.id, { role: e.target.value as Profile["role"] })}>
              <option value="contributor">contributor</option><option value="reviewer">reviewer</option><option value="admin">admin</option>
            </select>
            <div className="flex gap-1 flex-wrap">
              {languages.map((l) => {
                const on = p.languages.includes(l.code);
                return (
                  <button key={l.code} onClick={() => update(p.id, { languages: on ? p.languages.filter((x) => x !== l.code) : [...p.languages, l.code] })}
                    className={`text-xs rounded-full px-2 py-0.5 border ${on ? "bg-brand text-surface border-brand" : "border-line"}`}>{l.code}</button>
                );
              })}
            </div>
            <span className="text-xs text-muted ml-auto">{p.agreement_signed_at ? "agreement ✓" : "no agreement"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

type Hit = { title: string; thumb: string; url: string; page: string; license: string; licenseUrl: string; artist: string };

// Searches Wikimedia Commons straight from the browser (their API allows it), keeps only reusable licenses.
async function commons(q: string): Promise<Hit[]> {
  const api = new URL("https://commons.wikimedia.org/w/api.php");
  Object.entries({
    action: "query", format: "json", origin: "*", generator: "search", gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6", gsrlimit: "16", prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "640",
  }).forEach(([k, v]) => api.searchParams.set(k, v));
  const res = await fetch(api);
  const json = await res.json();
  const pages = Object.values(json.query?.pages ?? {}) as { title: string; imageinfo?: { thumburl: string; url: string; descriptionurl: string; extmetadata: Record<string, { value: string }> }[] }[];
  const strip = (s?: string) => (s ?? "").replace(/<[^>]+>/g, "").trim();
  return pages.flatMap((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii) return [];
    const lic = strip(ii.extmetadata.LicenseShortName?.value);
    if (!/^(CC0|CC BY(-SA)? \d|Public domain)/i.test(lic)) return [];
    return [{ title: p.title, thumb: ii.thumburl, url: ii.thumburl || ii.url, page: ii.descriptionurl, license: lic,
      licenseUrl: strip(ii.extmetadata.LicenseUrl?.value), artist: strip(ii.extmetadata.Artist?.value) || "Unknown" }];
  });
}

export function PhotoPicker({ concepts }: { concepts: { id: string; slug: string; english: string }[] }) {
  const [i, setI] = useState(0);
  const [q, setQ] = useState(concepts[0]?.english ?? "");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const c = concepts[i];
  if (!c) return <section className={box}><h2 className={h2}>Photos</h2><p className="text-muted mt-2">Every concept has a photo.</p></section>;

  async function find(term = q) { setBusy(true); setMsg(null); try { setHits(await commons(term)); } catch { setMsg("Commons search failed."); } setBusy(false); }
  async function pick(h: Hit) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("media").insert({
      kind: "image", concept_id: c.id, url: h.url, license: h.license, license_url: h.licenseUrl || null,
      source_url: h.page, creator: h.artist, credit: `Photo: ${h.artist}, ${h.license}, via Wikimedia Commons`,
      is_primary: true, status: "approved", contributor_id: user?.id,
    });
    if (error) { setMsg(error.message); return; }
    setMsg(`Saved photo for ${c.english}.`);
    const next = i + 1; setI(next); setHits(null); setQ(concepts[next]?.english ?? "");
    router.refresh();
  }

  return (
    <section className={box}>
      <h2 className={h2}>Photos: {concepts.length - i} concepts need one</h2>
      <p className="text-sm text-muted mt-1">Searches Wikimedia Commons and only shows CC0, CC BY, CC BY-SA or public domain files. License and credit are saved with the photo.</p>
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <span className="font-semibold capitalize">{c.english}</span>
        <input className="input !w-64 !py-1.5" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && find()} />
        <button onClick={() => find()} className="btn btn-primary !py-1.5">{busy ? "…" : "Search Commons"}</button>
        <button onClick={() => { const n = i + 1; setI(n); setHits(null); setQ(concepts[n]?.english ?? ""); }} className="btn btn-ghost !py-1.5">Skip</button>
      </div>
      {msg && <p className="text-sm mt-2 text-leaf">{msg}</p>}
      {hits && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {hits.map((h) => (
            <button key={h.page} onClick={() => pick(h)} className="card overflow-hidden text-left hover:ring-2 hover:ring-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.thumb} alt={h.title} className="aspect-[4/3] w-full object-cover" />
              <div className="p-2 text-[11px] text-muted truncate">{h.license} · {h.artist}</div>
            </button>
          ))}
          {!hits.length && <p className="text-sm text-muted col-span-full">No reusable photos. Try another word, or photograph it at the market.</p>}
        </div>
      )}
    </section>
  );
}

export function AddConcept({ collections, languages }: { collections: Collection[]; languages: Language[] }) {
  const [english, setEnglish] = useState("");
  const [gloss, setGloss] = useState("");
  const [col, setCol] = useState(collections[0]?.slug ?? "");
  const [names, setNames] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const slug = english.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { data, error } = await supabase.from("concepts").insert({ slug, english: english.trim(), gloss: gloss || null, collection_slug: col }).select("id").single();
    if (error) { setMsg(error.message); return; }
    const rows = Object.entries(names).filter(([, v]) => v.trim()).map(([language, form]) => ({
      concept_id: data.id, language, form: form.trim().normalize("NFC"), is_primary: true, source: "lead", status: "pending", contributor_id: user?.id,
    }));
    if (rows.length) await supabase.from("lexemes").insert(rows);
    setMsg(`Added “${english}”. Names are waiting in the review queue.`);
    setEnglish(""); setGloss(""); setNames({});
    router.refresh();
  }

  return (
    <section className={box}>
      <h2 className={h2}>Add a concept</h2>
      <form onSubmit={save} className="mt-4 grid sm:grid-cols-3 gap-3">
        <input className="input" required placeholder="English label, e.g. calabash" value={english} onChange={(e) => setEnglish(e.target.value)} />
        <input className="input" placeholder="Short meaning (optional)" value={gloss} onChange={(e) => setGloss(e.target.value)} />
        <select className="input" value={col} onChange={(e) => setCol(e.target.value)}>{collections.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        {languages.map((l) => (
          <input key={l.code} className="input word" placeholder={`${l.name} name`} value={names[l.code] ?? ""} onChange={(e) => setNames({ ...names, [l.code]: e.target.value })} />
        ))}
        <button className="btn btn-primary justify-self-start">Add</button>
        {msg && <p className="text-sm text-leaf sm:col-span-3">{msg}</p>}
      </form>
    </section>
  );
}

export function BulkTasks({ languages }: { languages: Language[] }) {
  const [text, setText] = useState("");
  const [langs, setLangs] = useState<string[]>(languages.map((l) => l.code));
  const [msg, setMsg] = useState<string | null>(null);
  async function save() {
    const lines = text.split("\n").map((s) => s.trim()).filter(Boolean);
    const rows = lines.flatMap((source_text) => langs.map((target_language) => ({ source_text, target_language })));
    const { error } = await createClient().from("tasks").insert(rows);
    setMsg(error ? error.message : `Created ${rows.length} tasks. Run scripts/draft-tasks.mjs to add AI drafts.`);
    if (!error) setText("");
  }
  return (
    <section className={box}>
      <h2 className={h2}>New Fix-the-AI tasks</h2>
      <p className="text-sm text-muted mt-1">One English sentence per line. One task is created per sentence per language.</p>
      <textarea className="input mt-3 min-h-32" value={text} onChange={(e) => setText(e.target.value)} placeholder={"The market is busy on Fridays.\nMy mother is cooking soup."} />
      <div className="mt-3 flex gap-2 flex-wrap items-center">
        {languages.map((l) => (
          <label key={l.code} className="text-sm flex items-center gap-1">
            <input type="checkbox" checked={langs.includes(l.code)} onChange={(e) => setLangs(e.target.checked ? [...langs, l.code] : langs.filter((x) => x !== l.code))} />{l.name}
          </label>
        ))}
        <button onClick={save} className="btn btn-primary !py-1.5 ml-auto">Create tasks</button>
      </div>
      {msg && <p className="text-sm mt-2">{msg}</p>}
    </section>
  );
}
