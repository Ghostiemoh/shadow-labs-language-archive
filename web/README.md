# Web app

Next.js 15 + Supabase. Picture dictionary, Fix-the-AI tasks, review queue, contributor accounts.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

The public Supabase URL and publishable key in `.env.example` are safe to share: row level security in the database controls access.

## What's where

| Path | What it does |
|---|---|
| `/` `/browse` `/concept/[slug]` `/search` | Public dictionary. Search works with or without tone marks |
| `/login` `/me` | Accounts, languages spoken, contribution agreement, acceptance rate |
| `/tasks` `/tasks/[id]` | Fix-the-AI: correct the draft, record it, tag the AI's mistakes |
| `/review` | Reviewers approve or reject names, recordings and tasks (keys A / R / J / K) |
| `/admin` | Roles, photo picker (Wikimedia Commons, reusable licenses only), add concepts, bulk tasks, CSV exports |
| `supabase/migrations/` | Database schema, access rules, review function |
| `data/` | Seed concepts, AI-draft names, starter tasks, photo credits |
| `scripts/` | Photo import from iNaturalist, seed builder, AI drafting for tasks |

## Rules built into the database

- Every name, sentence, recording and task has a `language`. Adding Fulfulde is a row in `languages` plus a lead.
- New items start as `pending`. Only a reviewer for that language (or an admin) can approve them, through `review_item()`.
- Reviewers can't approve their own work. Approving a task publishes its sentence and recording.
- Every image and recording stores license, source and credit.
- The **first account to sign up becomes admin**. Sign up yourself first.

## Before launch

- Set `NEXT_PUBLIC_SHOW_DRAFTS=false` so only reviewed names show.
- Set the Supabase Site URL to the live domain (Authentication → URL Configuration) so confirmation emails link back correctly.
- Move audio from Supabase Storage (1 GB free) to Cloudflare R2 when it gets close to the limit.
