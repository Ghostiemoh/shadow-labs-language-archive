# Plan

The full map: what we're building, in what order, and what each stage has to prove before the next one starts.

## One line

Verified data and native-speaker talent for Nigerian languages, collected through a free dictionary and picture encyclopedia that anyone can use.

## The problem

- Nigeria has 500+ languages. Hausa, Yoruba and Igbo alone have well over 100 million speakers.
- AI tools handle them badly: wrong tones, wrong dialect, literal translations, no native audio.
- The open data that exists is mostly news and religious text. Researchers say Hausa still lacks open datasets (see `research.md`).
- Companies that need Nigerian language work (AI labs, NGOs, fintechs, film producers) have no single place to get checked data or vetted people.

## What we build

1. **Dictionary and picture encyclopedia.** Built around concepts, not English words. One concept ("goat") has a photo and a name in each language, with audio, tone marks, dialect tags and example sentences. Hausa to Igbo works without going through English. A new language is a new set of names on the same concepts.
2. **Fix-the-AI tasks.** The main contributor task. An AI drafts a translation of a sentence. A native speaker corrects the text, records it in their own voice, and marks what the AI got wrong. Each task produces a corrected translation, a matched audio recording, and a record of the AI's mistakes.
3. **Contributors and reviewers.** People sign up for their language, do tasks, and get paid for each accepted item. A reviewer for that language checks everything before it goes live or gets paid.
4. **Datasets.** Reviewed data, bundled by language and type, licensed to AI companies and researchers. Open layer free; paid layer for volume, verified audio, and custom collections.
5. **Talent.** Contributors with a strong track record get referred for paid translation, subtitling and voiceover work. We take a commission.
6. **API.** A correction layer for AI companies: glossaries, tones, morphology, dialects.

## Why us

- Native-speaker review on everything. AI drafts are never the final word.
- Every item carries consent, license, source and credit from day one, so the data can be sold legally.
- Each contributor's acceptance rate is tracked, so we know who is good before a client asks.
- Founder is a native Hausa speaker who does data analytics.

## Revenue

| Source | When | Notes |
|---|---|---|
| Grants | Stage 1 onward | Lacuna Fund, Wikimedia, N-ATLAS challenge |
| Talent commissions | Stage 3 | 15–25% of translation and voiceover jobs |
| Dataset licensing | Stage 3 | Collections a buyer has paid for before we collect them |
| API | Stage 4 | Subscription or per call |

## Stages

Each stage ends with a result that unlocks the next one.

### Stage 0: foundation (now, about one month)
- Pick the brand name. Check the domain, CAC name availability and social handles.
- Register Shadow Labs Ltd with CAC. Open a company bank account.
- Find a Yoruba lead and an Igbo lead. Founder leads and reviews Hausa.
- Write the contribution agreement: consent, rights to license, payment terms.

**Done when:** the company is registered, the name is locked, and three language leads are agreed.

### Stage 1: proof (months 1–3)
- Build the web app: concept pages, search, audio, review queue.
- Add 500 concepts in four collections (animals, food, clothing and crafts, household items), with Hausa in full and Yoruba and Igbo names added by their leads.
- Build the Fix-the-AI task for the three leads to use.
- Launch. Post entries on X and Instagram.

**Done when:** 500 reviewed concepts are live in three languages, with audio. This is the proof for grant applications.

### Stage 2: community (months 3–6)
- Open contributor sign-up for all three languages.
- Payouts per accepted item (Paystack or Flutterwave transfers).
- Contributor profiles with acceptance rate, items accepted and skills (translation, voice, review).
- Apply to Lacuna Fund, Wikimedia Rapid Fund and the N-ATLAS challenge.
- Publish a short report on how well current AI tools handle Hausa, Yoruba and Igbo, using the Fix-the-AI data.

**Done when:** at least 50 active contributors, 5,000 reviewed items, and one grant awarded.

### Stage 3: revenue (months 6–12)
- Talk to five possible buyers: an AI startup, an NGO, a fintech, a Kannywood or Nollywood producer, a research lab.
- First paid dataset collection.
- First talent referrals, matched by hand.
- Add a fourth language (Fulfulde first, then Kanuri, Tiv, Ijaw, Efik and others), each with its own lead.

**Done when:** first revenue from a dataset and from referrals.

### Stage 4: scale (year 2)
- API for AI companies.
- Talent matching built into the platform.
- Archive: proverbs, folktales, history, Ajami manuscripts.
- Raise from investors, using revenue and dataset size as proof.

## Budget (stages 0–1)

Run on free tiers until there is grant money or revenue.

- **AI drafts:** generated in batches and stored, not run live. Google Cloud Translation's free tier (500k characters a month) or a free LLM tier covers thousands of sentences. No model of our own until we have the data.
- **Voice recording:** the browser's built-in recorder. Free.
- **Database and file storage:** Supabase free tier (500 MB database, 1 GB storage). 500 concepts with audio in three languages fits easily.
- **Hosting:** Vercel free tier. Move to the paid plan (about $20/month) once the site earns money, since the free tier is for non-commercial use.
- **Images:** open-licensed sources and our own phone photos (see `research.md`).
- **Real costs:** CAC registration, the domain, and paying language leads and reviewers.

## Numbers we track from day one

- Concepts live, per language
- Hours of reviewed audio, per language
- Reviewed sentence pairs, per language pair
- Active contributors and their acceptance rate
- Monthly visitors
- AI error rate on Fix-the-AI tasks, per language

## Team

- Founder: product, Hausa lead and reviewer, data.
- Yoruba lead: to be found.
- Igbo lead: to be found.
- Later: an advisor from a university Hausa, Yoruba or Igbo department (BUK, ABU, UNILAG, UNN).

## Risks

- **Bad contributions** (people pasting in machine translation). Answer: pay only for accepted items, review everything, track acceptance rates.
- **No buyers yet.** Answer: grants fund stages 1 and 2. Collect paid datasets only after a buyer has committed.
- **Language leads leave.** Answer: pay them and give each lead a clear role. Train a second reviewer per language.
- **Rights problems.** Answer: a signed contribution agreement and consent for voice before any upload is accepted.
