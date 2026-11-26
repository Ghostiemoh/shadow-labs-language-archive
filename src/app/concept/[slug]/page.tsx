import Link from "next/link";
import { notFound } from "next/navigation";
import { getConcept, getConcepts, getLanguages, getSentences, getViewer } from "@/lib/data";
import { AudioButton } from "@/components/AudioButton";
import { LangChip, StatusBadge } from "@/components/Badges";
import { ConceptCard } from "@/components/ConceptCard";
import { AddName } from "@/components/AddName";
import { MicOff } from "lucide-react";

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getConcept(slug);
  if (!c) return { title: "Not found" };
  const names = (c.lexemes ?? []).map((l) => l.form).join(" · ");
  const img = c.media?.find((m) => m.kind === "image");
  return {
    title: `${c.english}: ${names}`,
    description: `${c.english} in Hausa, Yoruba and Igbo: ${names}.`,
    openGraph: img ? { images: [img.url] } : undefined,
  };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = await getConcept(slug);
  if (!concept) notFound();
  const [languages, sentences, related, viewer] = await Promise.all([
    getLanguages(), getSentences(concept.id), getConcepts(concept.collection_slug ?? undefined, 60), getViewer(),
  ]);
  const img = concept.media?.find((m) => m.kind === "image");
  const audio = (concept.media ?? []).filter((m) => m.kind === "audio");
  const others = related.filter((c) => c.id !== concept.id).slice(0, 4);

  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-20">
      <Link href={`/browse/${concept.collection_slug}`} className="link text-[0.9rem] capitalize">← {concept.collection_slug?.replace("-", " and ")}</Link>

      <div className="mt-5 grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-14 items-start">
        <div className="lg:order-2">
          <p className="eyebrow">Concept</p>
          <h1 className="display mt-1 text-[length:var(--step-4)] first-letter:uppercase">{concept.english}</h1>
          {concept.gloss && <p className="mt-1 text-ink-soft">{concept.gloss}</p>}

          <div className="mt-6 border-t border-ink/80">
            {languages.map((l) => {
              const names = (concept.lexemes ?? []).filter((x) => x.language === l.code);
              return (
                <section key={l.code} aria-label={l.name} className="border-b border-line py-5">
                  <div className="flex items-baseline gap-2">
                    <span className="eyebrow !text-ink">{l.name}</span>
                    <span className="word text-[0.9rem] text-muted">{l.native_name}</span>
                  </div>
                  {names.length ? (
                    <ul className="mt-2 grid gap-3">
                      {names.map((n) => {
                        const voice = audio.find((a) => a.lexeme_id === n.id);
                        return (
                          <li key={n.id} className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                            {voice ? <AudioButton src={voice.url} label={`Hear ${n.form}`} /> : (
                              <span className="size-11 shrink-0 grid place-items-center rounded-full border border-dashed border-line-strong text-muted" title="No recording yet"><MicOff aria-hidden className="size-4" /><span className="sr-only">No recording yet</span></span>
                            )}
                            <span className="word text-[length:var(--step-4)] font-bold leading-none">{n.form}</span>
                            <span className="flex items-center gap-3">
                              <StatusBadge status={n.status} source={n.source} />
                              {n.dialect && <span className="text-[0.8rem] text-muted">{n.dialect}</span>}
                              {voice?.creator && <span className="text-[0.8rem] text-muted">voice: {voice.creator}</span>}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-ink-soft">No {l.name} name yet. Do you know it?</p>
                  )}
                  <AddName conceptId={concept.id} language={l.code} languageName={l.name} signedIn={!!viewer.userId}
                    lexemes={names.map((n) => ({ id: n.id, form: n.form }))} />
                </section>
              );
            })}
          </div>

          {sentences.length > 0 && (
            <div className="mt-10">
              <h2 className="display text-[length:var(--step-2)]">In a sentence</h2>
              <ul className="mt-3 divide-y divide-line">
                {sentences.map((s) => (
                  <li key={s.id} className="py-3">
                    <div className="flex items-baseline gap-2"><LangChip code={s.language} /><span className="word text-[1.2rem]">{s.text}</span></div>
                    {s.english && <div className="pl-9 text-[0.9rem] text-muted">{s.english}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {concept.cultural_note && <p className="mt-8 prose-measure leading-relaxed text-ink-soft">{concept.cultural_note}</p>}
        </div>

        <figure className="lg:order-1 lg:sticky lg:top-24">
          <div className="aspect-[4/3] bg-sand rounded-[4px] overflow-hidden">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt={concept.english} className="size-full object-cover" />
            ) : (
              <div className="size-full grid place-items-center text-center p-8">
                <div>
                  <div className="display text-5xl text-line-strong capitalize">{concept.english}</div>
                  <p className="mt-3 text-[0.9rem] text-muted">No picture yet. A market photo of the real thing is best.</p>
                </div>
              </div>
            )}
          </div>
          {img && (
            <figcaption className="mt-2 text-[0.78rem] text-muted">
              {img.ai_generated && <b className="font-semibold text-ink-soft">AI image. </b>}
              {img.credit}
              {img.source_url && <> · <a href={img.source_url} className="link" target="_blank" rel="noreferrer">source</a></>}
              {img.license_url && <> · <a href={img.license_url} className="link" target="_blank" rel="noreferrer">licence</a></>}
            </figcaption>
          )}
        </figure>
      </div>

      {others.length > 0 && (
        <section className="mt-20">
          <h2 className="display text-[length:var(--step-3)]">More in this collection</h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
            {others.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
          </div>
        </section>
      )}
    </article>
  );
}
