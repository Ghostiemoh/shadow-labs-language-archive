# Shadow Labs: Nigerian Language Archive

Context for Claude Code. This repo continues a planning conversation from claude.ai (27–30 Oct 2026). Read this file and `docs/` before doing anything.

## Who

Muhammad Auwal Abdulaziz (Ghostly Shadow), Abuja. GitHub @Ghostiemoh. Native Hausa speaker. Works in data analytics, Web3/Solana content, and education content.

Writing style: direct, plain prose. No AI-sounding phrasing, no rhetorical scaffolding.

## The idea

A Hausa archive that grows into Nigeria's language archive (Hausa, then Yoruba and Igbo, later Fulfulde, Kanuri, Tiv, Efik).

1. Dictionary: look up any Hausa word, get English, audio, tone marks, dialect tags.
2. Visual encyclopedia: short entries with photos for concrete things (animals, food, clothing, tools, places).
3. API for AI companies: a correction layer (glossaries, tones, morphology, dialects), not general translation.
4. Services: human-checked translation, subtitles, voiceovers.
5. Archive: proverbs (karin magana), folktales (tatsuniyoyi), history, Ajami manuscripts, novels with author permission.

## Decisions so far

- The real business is verified, structured language data. The dictionary and archive are how it gets collected.
- Launch Hausa only. Build the platform multi-language from day one (`language` field on everything). Add Yoruba and Igbo later, each with a native-speaker lead who owns quality.
- Pick a brand that isn't Hausa-specific. Name candidates so far: Rumbu, Taska (both Hausa-only, so maybe for the Hausa section).
- Company: register Shadow Labs Ltd with CAC (about ₦30k–50k, 1–2 weeks). Run the archive as a Shadow Labs product. Spin it out as its own Ltd only when raising money or needing separate contracts.
- Open layer (free, grant-funded) vs paid layer (verified audio, parallel sentences, dialect-tagged speech sold to companies).
- Funding order: grants, then paid client work, then data buyers who commit before collection. Investors later.
- Native-speaker reviewers check everything before it goes live. AI drafts are never the final word.
- Store license, source, and credit with every image and audio file from day one.

## First milestone

500 entries with photos and audio, in themed collections (animals, food, clothing and crafts, household items). Then launch, post on X/Instagram, and use it as proof for grant applications.

## Suggested stack

Next.js + Supabase on Vercel free tiers. Supabase Storage for images and audio.

## Open questions

- Final brand name
- Repo/product scope for the MVP schema (see `docs/roadmap.md`)
