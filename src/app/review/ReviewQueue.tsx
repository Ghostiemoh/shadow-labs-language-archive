"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AudioButton } from "@/components/AudioButton";

export type QueueItem = {
  type: "lexeme" | "media" | "task"; id: string; title: string; sub?: string; detail?: string;
  tags?: string[]; note?: string; audio?: string; image?: string; href?: string;
};

const LABEL = { lexeme: "Name", media: "Recording", task: "Fix-the-AI" };

export function ReviewQueue({ items: initial }: { items: QueueItem[] }) {
  const [items, setItems] = useState(initial);
  const [cursor, setCursor] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function decide(item: QueueItem, decision: "approved" | "rejected") {
    setErr(null);
    const { error } = await createClient().rpc("review_item", {
      p_type: item.type, p_id: item.id, p_decision: decision, p_note: notes[item.id] || null,
    });
    if (error) { setErr(error.message); return; }
    setItems((xs) => xs.filter((x) => x.id !== item.id));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const it = items[cursor];
      if (e.key === "j") setCursor((c) => Math.min(c + 1, items.length - 1));
      if (e.key === "k") setCursor((c) => Math.max(c - 1, 0));
      if (it && e.key === "a") decide(it, "approved");
      if (it && e.key === "r") decide(it, "rejected");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!items.length) return <p className="mt-10 card p-6 text-center text-muted">All clear. Nothing waiting in this language.</p>;

  return (
    <div className="mt-6 grid gap-3">
      <p className="text-sm text-muted">{items.length} waiting</p>
      {err && <p className="text-clay text-sm">{err}</p>}
      {items.map((it, i) => (
        <div key={it.id} onFocusCapture={() => setCursor(i)}
          className={`card p-4 grid sm:grid-cols-[64px_1fr_auto] gap-4 items-center ${i === cursor ? "ring-2 ring-brand" : ""}`}>
          <div className="size-16 rounded-lg bg-line/60 overflow-hidden grid place-items-center text-xs text-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {it.image ? <img src={it.image} alt="" className="size-full object-cover" /> : LABEL[it.type]}
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase font-semibold text-muted">{LABEL[it.type]}</div>
            <div className="flex items-center gap-3 flex-wrap">
              {it.audio && <AudioButton src={it.audio} />}
              <span className="word text-2xl font-semibold">{it.title}</span>
            </div>
            {it.sub && <div className="text-sm text-muted mt-0.5">{it.sub}</div>}
            {it.detail && <div className="text-sm text-ink/60 word line-through decoration-clay/40">{it.detail}</div>}
            {it.tags?.length ? <div className="mt-1 flex gap-1 flex-wrap">{it.tags.map((t) => <span key={t} className="text-[11px] rounded-full bg-clay-soft text-clay px-2">{t}</span>)}</div> : null}
            {it.note && <div className="text-sm mt-1">Note: {it.note}</div>}
            <input className="input !py-1.5 text-sm mt-2" placeholder="Note to contributor (optional)"
              value={notes[it.id] ?? ""} onChange={(e) => setNotes({ ...notes, [it.id]: e.target.value })} />
          </div>
          <div className="flex sm:flex-col gap-2">
            <button onClick={() => decide(it, "approved")} className="btn bg-leaf text-surface justify-center">Approve</button>
            <button onClick={() => decide(it, "rejected")} className="btn btn-ghost justify-center">Reject</button>
            {it.href && <a href={it.href} target="_blank" className="text-xs text-brand text-center">open</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
