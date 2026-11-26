// Writes AI drafts for open tasks that have none. Run by hand, never live:
//   GOOGLE_TRANSLATE_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/draft-tasks.mjs
// or GEMINI_API_KEY=... instead of Google. Free tiers: Google 500k chars/month; Gemini free tier.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://asbxctqqtrkjkorgksfe.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) throw new Error("Set SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Project Settings → API). Never commit it.");
const supabase = createClient(url, key);
const NAMES = { ha: "Hausa", yo: "Yoruba", ig: "Igbo", ff: "Fulfulde", kr: "Kanuri" };

async function google(text, target) {
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "en", target, format: "text" }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j));
  return j.data.translations[0].translatedText;
}
async function gemini(text, target) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: `Translate into ${NAMES[target]} with full standard orthography and tone marks. Reply with the translation only.\n\n${text}` }] }] }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(j));
  return j.candidates[0].content.parts[0].text.trim();
}

const engine = process.env.GOOGLE_TRANSLATE_API_KEY ? ["google-translate-v2", google] : process.env.GEMINI_API_KEY ? ["gemini-2.5-flash", gemini] : null;
if (!engine) throw new Error("Set GOOGLE_TRANSLATE_API_KEY or GEMINI_API_KEY");

const { data: tasks, error } = await supabase.from("tasks").select("id, source_text, target_language").is("ai_draft", null).eq("status", "open").limit(500);
if (error) throw error;
let n = 0;
for (const t of tasks) {
  try {
    const draft = await engine[1](t.source_text, t.target_language);
    await supabase.from("tasks").update({ ai_draft: draft, ai_engine: engine[0] }).eq("id", t.id);
    n++;
  } catch (e) { console.log("failed", t.id, e.message); }
}
console.log(`drafted ${n} of ${tasks.length} tasks with ${engine[0]}`);
