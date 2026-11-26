import { createClient } from "@/lib/supabase/server";
import { VISIBLE } from "@/lib/site";
import type { Collection, Concept, Language, Profile } from "@/lib/types";

const CONCEPT_FIELDS =
  "id, slug, english, gloss, collection_slug, cultural_note, lexemes(id, concept_id, language, form, dialect, notes, source, status, is_primary, contributor_id), media(id, kind, url, license, license_url, source_url, creator, credit, ai_generated, concept_id, lexeme_id, language, status, is_primary)";

export async function getLanguages(activeOnly = true): Promise<Language[]> {
  const supabase = await createClient();
  let q = supabase.from("languages").select("*").order("sort");
  if (activeOnly) q = q.eq("active", true);
  const { data } = await q;
  return data ?? [];
}

export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").order("sort");
  return data ?? [];
}

function clean(c: Concept): Concept {
  return {
    ...c,
    lexemes: (c.lexemes ?? []).filter((l) => VISIBLE.includes(l.status)),
    media: (c.media ?? []).filter((m) => m.status === "approved"),
  };
}

export async function getConcepts(collection?: string, limit = 200): Promise<Concept[]> {
  const supabase = await createClient();
  let q = supabase.from("concepts").select(CONCEPT_FIELDS).order("english").limit(limit);
  if (collection) q = q.eq("collection_slug", collection);
  const { data } = await q;
  return ((data ?? []) as Concept[]).map(clean);
}

export async function getConcept(slug: string): Promise<Concept | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("concepts").select(CONCEPT_FIELDS).eq("slug", slug).maybeSingle();
  return data ? clean(data as Concept) : null;
}

export async function getSentences(conceptId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sentences")
    .select("id, language, text, english, status")
    .eq("concept_id", conceptId)
    .in("status", VISIBLE);
  return data ?? [];
}

// Search English labels and every language's names, with or without tone marks.
export async function search(term: string): Promise<Concept[]> {
  const t = term.trim();
  if (!t) return [];
  const supabase = await createClient();
  const like = `%${t.replace(/[%_]/g, "")}%`;
  const { data: plain } = await supabase.rpc("make_plain", { t });
  const plainLike = `%${String(plain ?? t).replace(/[%_]/g, "")}%`;
  const [{ data: byName }, { data: byEnglish }] = await Promise.all([
    supabase.from("lexemes").select("concept_id").ilike("plain", plainLike).in("status", VISIBLE).limit(100),
    supabase.from("concepts").select("id").or(`english.ilike.${like},gloss.ilike.${like}`).limit(100),
  ]);
  const ids = [...new Set([...(byEnglish ?? []).map((r) => r.id), ...(byName ?? []).map((r) => r.concept_id)])];
  if (!ids.length) return [];
  const { data } = await supabase.from("concepts").select(CONCEPT_FIELDS).in("id", ids).order("english");
  return ((data ?? []) as Concept[]).map(clean);
}

export async function getStats() {
  const supabase = await createClient();
  const [{ data: langs }, { count: concepts }, { count: photos }] = await Promise.all([
    supabase.from("language_stats").select("*").eq("active", true).order("sort"),
    supabase.from("concepts").select("*", { count: "exact", head: true }),
    supabase.from("media").select("*", { count: "exact", head: true }).eq("kind", "image").eq("status", "approved"),
  ]);
  return { langs: langs ?? [], concepts: concepts ?? 0, photos: photos ?? 0 };
}

export async function getViewer(): Promise<{ userId: string | null; email: string | null; profile: Profile | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, email: null, profile: null };
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { userId: user.id, email: user.email ?? null, profile: (data as Profile) ?? null };
}

export function canReview(profile: Profile | null, lang?: string) {
  if (!profile) return false;
  if (profile.role === "admin") return true;
  return profile.role === "reviewer" && (!lang || profile.languages.includes(lang));
}
