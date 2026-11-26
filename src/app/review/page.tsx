import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canReview, getLanguages, getViewer } from "@/lib/data";
import { ReviewQueue, type QueueItem } from "./ReviewQueue";

export const metadata = { title: "Review" };
export const dynamic = "force-dynamic";

export default async function Review({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { profile } = await getViewer();
  if (!profile || !canReview(profile)) redirect("/");
  const languages = (await getLanguages()).filter((l) => canReview(profile, l.code));
  const { lang: q } = await searchParams;
  const lang = q && languages.some((l) => l.code === q) ? q : languages[0]?.code;
  if (!lang) return <p className="p-10">No languages assigned to you yet.</p>;

  const supabase = await createClient();
  const [{ data: names }, { data: audio }, { data: tasks }] = await Promise.all([
    supabase.from("lexemes").select("id, form, dialect, source, contributor_id, concepts(slug, english, media(url, kind, status))")
      .eq("language", lang).eq("status", "pending").order("created_at").limit(100),
    supabase.from("media").select("id, url, creator, lexeme_id, sentence_id, lexemes(form), concepts(slug, english)")
      .eq("language", lang).eq("kind", "audio").eq("status", "pending").is("sentence_id", null).order("created_at").limit(50),
    supabase.from("tasks").select("id, source_text, ai_draft, corrected_text, error_tags, contributor_note, audio_media_id, media:audio_media_id(url)")
      .eq("target_language", lang).eq("status", "submitted").order("submitted_at").limit(50),
  ]);

  type Img = { url: string; kind: string; status: string };
  const items: QueueItem[] = [
    ...(tasks ?? []).map((t) => ({
      type: "task" as const, id: t.id, title: t.corrected_text ?? "", sub: `“${t.source_text}”`,
      detail: t.ai_draft ? `AI draft: ${t.ai_draft}` : undefined,
      tags: t.error_tags, note: t.contributor_note ?? undefined,
      audio: (t.media as unknown as { url: string } | null)?.url,
    })),
    ...(audio ?? []).map((m) => ({
      type: "media" as const, id: m.id,
      title: (m.lexemes as unknown as { form: string } | null)?.form ?? "Recording",
      sub: `${(m.concepts as unknown as { english: string } | null)?.english ?? ""} · voice: ${m.creator ?? "?"}`, audio: m.url,
    })),
    ...(names ?? []).map((n) => {
      const c = n.concepts as unknown as { slug: string; english: string; media: Img[] } | null;
      return {
        type: "lexeme" as const, id: n.id, title: n.form,
        sub: `${c?.english ?? ""}${n.dialect ? ` · ${n.dialect}` : ""} · ${n.source === "ai_draft" ? "AI draft" : "contributor"}`,
        image: c?.media?.find((m) => m.kind === "image" && m.status === "approved")?.url,
        href: c ? `/concept/${c.slug}` : undefined,
      };
    }),
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="display text-[length:var(--step-3)]">Review queue</h1>
      <p className="mt-2 text-muted">Nothing goes live, gets paid or enters a dataset until you approve it. Keyboard: <b>A</b> approve, <b>R</b> reject, <b>J</b>/<b>K</b> move.</p>
      <div className="mt-5 flex gap-2 flex-wrap">
        {languages.map((l) => (
          <a key={l.code} href={`/review?lang=${l.code}`} className={`btn !py-1.5 ${l.code === lang ? "btn-primary" : "btn-ghost"}`}>{l.name}</a>
        ))}
      </div>
      <ReviewQueue items={items} />
    </div>
  );
}
