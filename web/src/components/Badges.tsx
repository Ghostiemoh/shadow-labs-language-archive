import type { Status } from "@/lib/types";

export function StatusBadge({ status, source }: { status: Status; source?: string }) {
  if (status === "approved")
    return <span className="inline-flex items-center gap-1 rounded-full bg-leaf-soft text-leaf text-[11px] font-semibold px-2 py-0.5">✓ reviewed</span>;
  if (status === "rejected")
    return <span className="rounded-full bg-clay-soft text-clay text-[11px] font-semibold px-2 py-0.5">rejected</span>;
  return (
    <span title={source === "ai_draft" ? "AI draft, not yet checked by a native speaker" : "Waiting for review"}
      className="rounded-full bg-ochre/15 text-[#8a5f0c] text-[11px] font-semibold px-2 py-0.5">
      {source === "ai_draft" ? "AI draft" : "draft"}
    </span>
  );
}

const LANG_COLORS: Record<string, string> = { ha: "bg-indigo text-white", yo: "bg-clay text-white", ig: "bg-leaf text-white" };
export function LangChip({ code, label }: { code: string; label?: string }) {
  return (
    <span className={`inline-grid place-items-center rounded-md px-1.5 h-5 text-[11px] font-bold uppercase tracking-wide ${LANG_COLORS[code] ?? "bg-ink/80 text-white"}`}>
      {label ?? code}
    </span>
  );
}
