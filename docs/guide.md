# Step-by-step guide

What to do, in order, from today to launch. Easiest and most important things first. "You" is the founder; "Claude" is the coding work done in this repo.

Times are rough. Steps in the same week can run in parallel.

## Where things live

| What | Where | Free limit | When you'd pay |
|---|---|---|---|
| Code | GitHub | Unlimited | Never for this |
| Database (text, users, reviews) | Supabase | 500 MB | Supabase Pro ($25/month) after 500 MB. Text is small, so this is far off |
| Images and audio | Cloudflare R2 | 10 GB, no download fees | About $0.015 per GB a month above 10 GB |
| Website | Vercel to start | Free for non-commercial use | Move to Cloudflare (free, commercial use allowed) or Vercel Pro once it earns |
| AI drafts | Google Cloud Translation | 500,000 characters a month | Set a budget alert so it never charges by surprise |
| Backups | Google Drive | 15 GB | Never, for backups |

Images and audio go in R2, not Supabase Storage. R2 gives 10 GB free instead of 1 GB, and the website keeps working from it. Google Drive is for backup copies only: it isn't built to serve files to a website.

## Week 1: setup (you, no code)

- [ ] **Name.** Shortlist 3. For each, check the `.com` and `.ng` domain, CAC name availability, and X and Instagram handles. Ask one Yoruba and one Igbo speaker how it sounds.
- [ ] **Accounts.** You have GitHub and Supabase. Create:
  - Vercel: sign in with GitHub.
  - Cloudflare: free account.
  - Google Cloud: needs a card even for the free tier. Turn on the Cloud Translation API, then set a budget alert at $1 under Billing → Budgets & alerts.
- [ ] **First word list.** In a Google Sheet, list 100 animals with columns: English, Hausa, Hausa dialect notes, Yoruba, Igbo. Fill English and Hausa. Leave Yoruba and Igbo for the leads.
- [ ] **Language leads.** Ask your network for one Yoruba and one Igbo speaker who write their language well, tone marks included. Agree a small fee per batch of 100 words.

## Week 2: the base app (Claude)

- [ ] Create the Next.js app and connect it to Supabase.
- [ ] Database tables: languages, concepts, names per language, sentences, audio, images (with license, source and credit), contributors, reviews, payouts.
- [ ] Connect Cloudflare R2 for images and audio.
- [ ] Image script: takes your word list, finds open-licensed photos on Wikimedia Commons, saves each with its license and credit. You pick the best one for each word.
- [ ] Deploy to Vercel so you can open it on your phone.

## Week 3: the first real pages (Claude)

- [ ] Concept page: photo, names in Hausa, Yoruba and Igbo, audio, sentences, photo credit.
- [ ] Browse by collection (animals, food, clothing and crafts, household items).
- [ ] Search in English, Hausa, Yoruba and Igbo.
- [ ] Sign-in for you and the leads.
- [ ] Review queue: nothing shows on the public site until a reviewer for that language approves it.

## Week 4: Fix-the-AI (Claude, then you test)

- [ ] AI draft script: sends a batch of sentences to Google Cloud Translation once and saves the drafts. Runs only when started by hand.
- [ ] Task page: shows the draft, the contributor fixes the text, records their voice in the browser, and ticks what the AI got wrong (tones, wrong word, wrong meaning, spelling).
- [ ] You do 20 Hausa tasks and say what's awkward. Claude fixes it.
- [ ] Weekly backup: a script exports the database and copies it, with the files list, to Google Drive.

## Weeks 5–8: content (you and the leads)

- [ ] Animals: 100 concepts, all three languages, audio for each name.
- [ ] Food, clothing and crafts, household items: 400 more concepts.
- [ ] Market photos for the cultural items open sources don't have.
- [ ] Two example sentences per concept, through Fix-the-AI.

## Alongside, when the name is chosen

- [ ] Register Shadow Labs Ltd with CAC.
- [ ] Buy the domain and point it at the site.
- [ ] Write the contribution agreement: consent for voice, rights to license, payment terms. Every contributor signs before uploading.

## Launch (around month 3)

- [ ] 500 reviewed concepts in three languages with audio.
- [ ] Post one concept a day on X and Instagram: photo, three names, audio clip.
- [ ] Apply to Wikimedia Rapid Fund first (smallest, fastest), then Lacuna Fund once CAC is done.
- [ ] Then stage 2 in `plan.md`: open sign-up and payouts.
