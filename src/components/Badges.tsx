import type { Status } from "@/lib/types";

// Status is stated in words, with a small mark. Reviewed work is the proof of quality, so it reads clearly.
export function StatusBadge({ status, source }: { status: Status; source?: string }) {
  if (status === "approved")
    return <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-leaf"><span aria-hidden>●</span> Reviewed</span>;
  if (status === "rejected")
    return <span className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-clay"><span aria-hidden>○</span> Rejected</span>;
  return (
    <span title={source === "ai_draft" ? "Drafted by AI, not yet checked by a native speaker" : "Waiting for a reviewer"}
      className="inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[oklch(0.52_0.11_70)]">
      <span aria-hidden>◌</span> {source === "ai_draft" ? "AI draft" : "Awaiting review"}
    </span>
  );
}

const LANG_TONE: Record<string, string> = { ha: "text-indigo", yo: "text-clay", ig: "text-leaf" };
export function LangChip({ code, label }: { code: string; label?: string }) {
  return (
    <span className={`inline-block w-7 shrink-0 text-[0.72rem] font-bold uppercase tracking-[0.08em] ${LANG_TONE[code] ?? "text-ink-soft"}`}>
      {label ?? code}
    </span>
  );
}
