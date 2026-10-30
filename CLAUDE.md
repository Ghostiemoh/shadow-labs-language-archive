# Shadow Labs: Nigerian Language Archive

Context for Claude Code. This repo continues a planning conversation from claude.ai (27–30 Oct 2026). Read this file and `docs/` before doing anything.

## Who

Muhammad Auwal Abdulaziz (Ghostly Shadow), Abuja. GitHub @Ghostiemoh. Native Hausa speaker. Works in data analytics, Web3/Solana content, and education content.

Writing style: direct, plain prose. No AI-sounding phrasing, no rhetorical scaffolding.

## The idea

A Hausa archive that grows into Nigeria's language archive (Hausa, then Yoruba and Igbo, later Fulfulde, Kanuri, Tiv, Efik).

1. Dictionary and picture encyclopedia, built around concepts: one concept has a photo and a name in each language, with audio, tone marks, dialect tags and sentences. Hausa to Igbo works without going through English.
2. Fix-the-AI tasks: an AI drafts a translation, a native speaker corrects the text, records it in their own voice and marks the AI's mistakes. This is the main contributor task.
3. Contributors: people sign up for their language and get paid per accepted item. Reviewers check everything first.
4. Datasets: verified data licensed to AI companies.
5. Talent: strong contributors get referred for translation, subtitle and voiceover jobs. We take a commission.
6. API for AI companies: a correction layer (glossaries, tones, morphology, dialects), not general translation.
7. Archive: proverbs (karin magana), folktales (tatsuniyoyi), history, Ajami manuscripts, novels with author permission.

## Decisions so far

- The real business is verified, structured language data. The dictionary and archive are how it gets collected.
- Launch with Hausa, Yoruba and Igbo. Founder leads and reviews Hausa; a native-speaker lead owns Yoruba and another owns Igbo. Build multi-language from day one (`language` field on everything) so Fulfulde, Kanuri, Tiv, Ijaw, Efik and others can be added, each with its own lead.
- Web app first. AI helps draft; humans decide. Our own model only once we have the data.
- Talent referrals start manual (founder matches contributors to jobs) before any marketplace feature.
- Pick a brand that works for all Nigerian languages, not just Hausa. Rumbu and Taska are Hausa-only, so they could name the Hausa section at most.
- Company: register Shadow Labs Ltd with CAC (about ₦30k–50k, 1–2 weeks). Run the archive as a Shadow Labs product. Spin it out as its own Ltd only when raising money or needing separate contracts.
- Open layer (free, grant-funded) vs paid layer (verified audio, parallel sentences, dialect-tagged speech sold to companies).
- Funding order: grants, then paid client work, then data buyers who commit before collection. Investors later.
- Native-speaker reviewers check everything before it goes live. AI drafts are never the final word.
- Store license, source, and credit with every image and audio file from day one.

## First milestone

500 concepts with photos and audio in Hausa, Yoruba and Igbo, in themed collections (animals, food, clothing and crafts, household items). Then launch, post on X/Instagram, and use it as proof for grant applications. Full staged plan in `docs/plan.md`.

## Suggested stack

Next.js + Supabase on Vercel free tiers. Supabase Storage for images and audio.

## Open questions

- Final brand name
- Repo/product scope for the MVP schema (see `docs/roadmap.md`)
