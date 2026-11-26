import { createClient } from "@/lib/supabase/server";

// Admin-only CSV exports of reviewed data. RLS still applies; the role check keeps it admin-only.
const csv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join("|") : v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
};

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = user ? await supabase.from("profiles").select("role").eq("id", user.id).single() : { data: null };
  if (me?.role !== "admin") return new Response("Forbidden", { status: 403 });
  const type = new URL(request.url).searchParams.get("type");
  let rows: Record<string, unknown>[] = [];
  if (type === "names") {
    const { data } = await supabase.from("lexemes").select("form, language, dialect, concepts(slug, english)").eq("status", "approved");
    rows = (data ?? []).map((r) => ({ concept: (r.concepts as unknown as { slug: string }).slug, english: (r.concepts as unknown as { english: string }).english, language: r.language, form: r.form, dialect: r.dialect }));
  } else if (type === "sentences") {
    const { data } = await supabase.from("sentences").select("language, text, english, media(url)").eq("status", "approved");
    rows = (data ?? []).map((r) => ({ language: r.language, text: r.text, english: r.english, audio: (r.media as unknown as { url: string }[])?.[0]?.url }));
  } else if (type === "ai_errors") {
    const { data } = await supabase.from("tasks").select("target_language, source_text, ai_engine, ai_draft, corrected_text, error_tags").eq("status", "approved");
    rows = data ?? [];
  } else return new Response("Unknown export", { status: 400 });
  return new Response(csv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
