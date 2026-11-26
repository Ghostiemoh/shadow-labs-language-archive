import type { SupabaseClient } from "@supabase/supabase-js";

const EXT: Record<string, string> = { "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "audio/mpeg": "mp3", "audio/wav": "wav" };

// Uploads a voice recording to the user's folder in the `media` bucket and records it in `media`.
export async function uploadAudio(
  supabase: SupabaseClient,
  userId: string,
  blob: Blob,
  link: { concept_id?: string | null; lexeme_id?: string | null; sentence_id?: string | null; language: string },
): Promise<{ id?: string; error?: string }> {
  const type = blob.type.split(";")[0] || "audio/webm";
  const path = `${userId}/${link.language}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[type] ?? "webm"}`;
  const up = await supabase.storage.from("media").upload(path, blob, { contentType: type, upsert: false });
  if (up.error) return { error: up.error.message };
  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
  const { data, error } = await supabase.from("media").insert({
    kind: "audio", url: pub.publicUrl, storage_path: path,
    license: "Contributor agreement v1", creator: profile?.display_name ?? null,
    credit: `Voice: ${profile?.display_name ?? "contributor"}`,
    concept_id: link.concept_id ?? null, lexeme_id: link.lexeme_id ?? null, sentence_id: link.sentence_id ?? null,
    language: link.language, status: "pending", contributor_id: userId,
  }).select("id").single();
  if (error) return { error: error.message };
  return { id: data.id };
}
