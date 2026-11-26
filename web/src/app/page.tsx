import Link from "next/link";
import { getCollections, getConcepts, getLanguages, getStats } from "@/lib/data";
import { ConceptCard } from "@/components/ConceptCard";
import { SearchBox } from "@/components/SearchBox";
import { LangChip } from "@/components/Badges";

export const revalidate = 60;

const FEATURED = ["goat", "elephant", "tortoise", "chicken", "camel", "guinea-fowl", "lion", "crocodile"];

export default async function Home() {
  const [languages, collections, animals, stats] = await Promise.all([
    getLanguages(), getCollections(), getConcepts("animals"), getStats(),
  ]);
  const featured = FEATURED.map((s) => animals.find((c) => c.slug === s)).filter(Boolean) as typeof animals;
  const goat = animals.find((c) => c.slug === "goat");
  const goatImg = goat?.media?.find((m) => m.kind === "image");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-12 pb-14 sm:pt-16 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <p className="label !text-clay">Hausa · Yoruba · Igbo</p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-[1.08] tracking-tight">
              One picture. Every Nigerian name for it.
            </h1>
            <p className="mt-5 text-lg text-ink/75 max-w-xl leading-relaxed">
              A picture dictionary written by native speakers, with tone marks, dialects and real voices.
              Go from Hausa to Igbo without passing through English.
            </p>
            <div className="mt-7 max-w-xl"><SearchBox /></div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
              Try:
              {["akuya", "ewúrẹ́", "ewu", "kola nut", "ọjị"].map((w) => (
                <Link key={w} href={`/search?q=${encodeURIComponent(w)}`} className="word text-indigo underline decoration-indigo/30 underline-offset-4 hover:decoration-indigo">{w}</Link>
              ))}
            </div>
          </div>

          {goat && (
            <Link href="/concept/goat" className="card overflow-hidden shadow-xl shadow-indigo/10 rotate-[0.6deg] hover:rotate-0 transition block">
              <div className="aspect-[5/4] bg-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {goatImg && <img src={goatImg.url} alt="A goat" className="size-full object-cover" />}
              </div>
              <div className="p-5 grid gap-2.5">
                {languages.map((l) => {
                  const n = goat.lexemes?.find((x) => x.language === l.code);
                  return (
                    <div key={l.code} className="flex items-baseline gap-3">
                      <span className="w-16 text-xs text-muted">{l.name}</span>
                      <span className="word text-2xl font-semibold">{n?.form ?? "…"}</span>
                    </div>
                  );
                })}
                {goatImg?.credit && <div className="text-[11px] text-muted pt-1">{goatImg.credit}</div>}
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-paper border-y border-line">
        <div className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
          <Stat n={stats.concepts} label="concepts" />
          <Stat n={stats.photos} label="openly licensed photos" />
          {stats.langs.map((l) => (
            <div key={l.code}>
              <div className="flex items-center gap-2"><LangChip code={l.code} /><span className="font-semibold">{l.name}</span></div>
              <div className="mt-1 text-sm text-muted">
                <b className="text-ink">{l.approved_names}</b> reviewed · {l.pending_names} drafts · {l.approved_audio} recordings
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-bold">Collections</h2>
          <Link href="/browse" className="text-indigo font-semibold text-sm">All collections →</Link>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((c, i) => (
            <Link key={c.slug} href={`/browse/${c.slug}`}
              className={`rounded-2xl p-5 min-h-40 flex flex-col justify-between text-white hover:-translate-y-0.5 transition ${["bg-indigo", "bg-clay", "bg-leaf", "bg-ink"][i % 4]}`}>
              <div className="font-serif text-2xl font-bold">{c.name}</div>
              <div className="text-white/80 text-sm">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="font-serif text-3xl font-bold">From the animals collection</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-indigo text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
          <div>
            <p className="label !text-white/60">Fix the AI</p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold leading-tight">AI gets our languages wrong. Native speakers fix it, and get paid.</h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              An AI drafts a sentence. You correct it, record it in your own voice and mark what the AI got wrong.
              A reviewer for your language checks it. Every accepted item is paid.
            </p>
            <Link href="/tasks" className="btn bg-white text-indigo mt-6 hover:bg-sand">Try a task</Link>
          </div>
          <div className="grid gap-3">
            <Step n={1} title="The AI drafts" body="“The goat is eating grass.” → Akuya tana cin ciyawa." />
            <Step n={2} title="You correct and record" body="Fix tone marks, wrong words or unnatural phrasing, then say it aloud." />
            <Step n={3} title="You tag the mistakes" body="Tone, spelling, wrong word, wrong meaning, dialect. This becomes the AI error report." />
            <Step n={4} title="A reviewer accepts it" body="Only reviewed items go live, count toward payouts and go into datasets." />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl font-bold text-indigo">{n.toLocaleString()}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-xl bg-white/8 border border-white/15 p-4 flex gap-4">
      <div className="shrink-0 grid place-items-center size-9 rounded-full bg-ochre text-ink font-bold">{n}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-white/75 text-sm mt-0.5 word">{body}</div>
      </div>
    </div>
  );
}
