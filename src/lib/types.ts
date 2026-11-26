export type Status = "pending" | "approved" | "rejected";
export type Role = "contributor" | "reviewer" | "admin";

export type Language = { code: string; name: string; native_name: string; active: boolean; sort: number };
export type Collection = { slug: string; name: string; description: string | null; sort: number };
export type Lexeme = {
  id: string; concept_id: string; language: string; form: string; dialect: string | null;
  notes: string | null; source: string; status: Status; is_primary: boolean; contributor_id: string | null;
};
export type Media = {
  id: string; kind: "image" | "audio"; url: string; license: string; license_url: string | null;
  source_url: string | null; creator: string | null; credit: string | null; ai_generated: boolean;
  concept_id: string | null; lexeme_id: string | null; language: string | null; status: Status; is_primary: boolean;
};
export type Concept = {
  id: string; slug: string; english: string; gloss: string | null; collection_slug: string | null;
  cultural_note: string | null; lexemes?: Lexeme[]; media?: Media[];
};
export type Profile = {
  id: string; display_name: string | null; role: Role; languages: string[];
  agreement_signed_at: string | null; created_at: string;
};
export type Task = {
  id: string; concept_id: string | null; source_text: string; target_language: string;
  ai_draft: string | null; ai_engine: string | null; status: string; claimed_by: string | null;
  corrected_text: string | null; error_tags: string[]; contributor_note: string | null;
  audio_media_id: string | null; submitted_at: string | null; review_note: string | null;
};
