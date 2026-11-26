import Link from "next/link";
import { getCollections, getConcepts, getLanguages, getStats } from "@/lib/data";
import { ConceptCard } from "@/components/ConceptCard";
import { SearchBox } from "@/components/SearchBox";
import { StatusBadge } from "@/components/Badges";

export const revalidate = 60;

const MILESTONE = 500;
const FEATURED = ["elephant", "kola-nut", "tortoise", "guinea-fowl", "okra", "camel", "lion", "groundnut"];

export default async function Home() {
  const [languages, collections, all, stats] = await Promise.all([getLanguages(), getCollections(), getConcepts(), getStats()]);
  const goat = all.find((c) => c.slug === "goat");
  const goatImg = goat?.media?.find((m) => m.kind === "image");
  const featured = FEATURED.map((s) => all.find((c) => c.slug === s)).filter(Boolean) as typeof all;

  return (
    <>
      {/* Specimen hero: the word is the hero, set large, with the picture as its plate. */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-14 pb-14 sm:pb-20 grid lg:grid-cols-[1fr_1.05fr] gap-10 lg:gap-16 items-start">
        <div className="order-2 lg:order-1 lg:pt-6">
          <p className="eyebrow rise">A picture dictionary · Hausa, Yoruba, Igbo</p>
          <h1 className="display rise rise-1 mt-4 text-[length:var(--step-5)] text-ink">
            Our languages, written and spoken by the people who own them.
          </h1>
          <p className="rise rise-2 mt-6 text-[1.08rem] leading-relaxed text-ink-soft prose-measure">
            Every word has a picture, its name in each language with full tone marks, and a native speaker&apos;s voice.
            Go from Hausa to Igbo without passing through English.
          </p>
          <div className="rise rise-3 mt-8 max-w-lg"><SearchBox /></div>
          <p className="rise rise-4 mt-3 text-[0.9rem] text-muted">
            Tone marks optional: <Link href="/search?q=ewure" className="link word">ewure</Link> finds <span className="word">ewúrẹ́</span>.
          </p>
        </div>

        {goat && (
          <Link href="/concept/goat" className="order-1 lg:order-2 group block rise">
            <figure>
              <div className="aspect-[4/3] overflow-hidden rounded-[4px] bg-sand">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {goatImg && <img src={goatImg.url} alt="A goat" fetchPriority="high" className="size-full object-cover" />}
              </div>
              <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                <span className="eyebrow">No. 001 · Goat</span>
                {goatImg?.credit && <span className="text-[0.75rem] text-muted text-right">{goatImg.credit}</span>}
              </figcaption>
            </figure>
            <dl className="mt-3 divide-y divide-line border-y border-line">
              {languages.map((l) => {
                const n = goat.lexemes?.find((x) => x.language === l.code);
                return (
                  <div key={l.code} className="flex items-baseline gap-4 py-2.5">
                    <dt className="eyebrow w-16 shrink-0">{l.name}</dt>
                    <dd className="word text-[length:var(--step-3)] font-bold text-ink group-hover:text-indigo transition-colors">{n?.form ?? "…"}</dd>
                    {n && <dd className="ml-auto hidden sm:block"><StatusBadge status={n.status} source={n.source} /></dd>}
                  </div>
                );
              })}
            </dl>
          </Link>
        )}
      </section>

      {/* Progress toward the first milestone. Honest numbers, one job: show how far there is to go. */}
      <section className="bg-surface border-y border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid md:grid-cols-[1fr_2fr] gap-8 items-start">
          <div>
            <h2 className="display text-[length:var(--step-2)]">Toward the first {MILESTONE}</h2>
            <p className="mt-2 text-ink-soft prose-measure">
              {stats.concepts} concepts so far. A name counts once a native speaker has reviewed it.
            </p>
          </div>
          <ul className="grid gap-5">
            {stats.langs.map((l) => {
              const pct = Math.min(100, (Number(l.approved_names) / MILESTONE) * 100);
              const draftPct = Math.min(100 - pct, (Number(l.pending_names) / MILESTONE) * 100);
              return (
                <li key={l.code}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{l.name} <span className="word font-normal text-muted">· {l.native_name}</span></span>
                    <span className="text-[0.88rem] text-ink-soft tabular-nums">
                      <b className="text-ink">{l.approved_names}</b> reviewed · {l.pending_names} drafts · {l.approved_audio} voices
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-sand overflow-hidden flex" role="img"
                    aria-label={`${l.name}: ${l.approved_names} of ${MILESTONE} reviewed, ${l.pending_names} drafts waiting`}>
                    <span className="h-full bg-leaf" style={{ width: `${pct}%` }} />
                    <span className="h-full bg-ochre/60" style={{ width: `${draftPct}%` }} />
                  </div>
                </li>
              );
            })}
            <li className="text-[0.85rem] text-muted flex gap-5">
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-leaf" /> reviewed</span>
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-ochre/60" /> AI drafts waiting</span>
              <Link href="/contribute" className="link ml-auto">Help review →</Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Collections as a catalogue index, not tiles. */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="display text-[length:var(--step-3)]">Collections</h2>
          <Link href="/browse" className="link text-[0.95rem]">Browse all</Link>
        </div>
        <ol className="mt-6 border-t border-ink/80">
          {collections.map((c, i) => {
            const items = all.filter((x) => x.collection_slug === c.slug);
            const thumbs = items.filter((x) => x.media?.some((m) => m.kind === "image")).slice(0, 4);
            return (
              <li key={c.slug} className="border-b border-line">
                <Link href={`/browse/${c.slug}`} className="group grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3.5rem_1fr_auto] gap-x-4 gap-y-3 items-center py-5">
                  <span className="display text-muted text-[length:var(--step-1)] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="display text-[length:var(--step-2)] group-hover:text-indigo transition-colors">{c.name}</span>
                    <span className="block text-[0.92rem] text-ink-soft">{c.description} · {items.length} entries</span>
                  </span>
                  <span className="col-start-2 sm:col-start-3 flex gap-1.5">
                    {thumbs.map((t) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={t.id} src={t.media!.find((m) => m.kind === "image")!.url} alt="" loading="lazy"
                        className="size-14 sm:size-16 rounded-[3px] object-cover" />
                    ))}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <h2 className="display text-[length:var(--step-3)]">From the archive</h2>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
          {featured.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
        </div>
      </section>

      {/* Fix the AI: show a real task instead of describing it. */}
      <section className="bg-indigo text-indigo-soft">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
          <div>
            <p className="eyebrow !text-ochre">Fix the AI · paid per accepted task</p>
            <h2 className="display mt-3 text-[length:var(--step-4)] text-surface">AI gets our languages wrong. Native speakers set it right.</h2>
            <p className="mt-5 leading-[1.7] prose-measure text-indigo-soft/90">
              An AI drafts a sentence. You correct it, read it aloud in your own voice and mark what it got wrong.
              A reviewer for your language checks it. Accepted work is paid, credited to you, and becomes data that teaches machines to do better.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tasks" className="btn bg-surface text-indigo hover:bg-sand">Try a task</Link>
              <Link href="/contribute" className="btn border border-indigo-soft/40 text-surface hover:border-surface">How it works</Link>
            </div>
          </div>

          <figure aria-label="Example task" className="rounded-[6px] bg-surface text-ink p-5 sm:p-7 shadow-[0_24px_60px_-24px_oklch(0.15_0.08_268/0.6)]">
            <div className="eyebrow">Translate into Hausa</div>
            <p className="display mt-2 text-[length:var(--step-2)]">“The goat is eating grass.”</p>
            <div className="mt-5 rule pt-4">
              <div className="label">AI draft</div>
              <p className="word mt-1 text-[1.25rem] text-muted line-through decoration-clay/50">Akuya tana cin ciyawa.</p>
            </div>
            <div className="mt-4">
              <div className="label">Your correction</div>
              <p className="word mt-1 text-[1.45rem] font-bold">Akuya na cin ciyawa.</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.8rem]">
              <span className="rounded-[3px] bg-clay-soft text-clay-deep font-semibold px-2 py-1">Grammar</span>
              <span className="rounded-[3px] bg-clay-soft text-clay-deep font-semibold px-2 py-1">Dialect</span>
              <span className="rounded-[3px] bg-sand text-ink-soft px-2 py-1">● 0:03 recording</span>
            </div>
            <figcaption className="mt-5 text-[0.78rem] text-muted">Illustrative example of the task screen.</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
