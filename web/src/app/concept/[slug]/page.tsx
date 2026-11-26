import Link from "next/link";
import { notFound } from "next/navigation";
import { getConcept, getConcepts, getLanguages, getSentences, getViewer } from "@/lib/data";
import { AudioButton } from "@/components/AudioButton";
import { LangChip, StatusBadge } from "@/components/Badges";
import { ConceptCard } from "@/components/ConceptCard";
import { AddName } from "@/components/AddName";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href={`/browse/${concept.collection_slug}`} className="text-sm text-indigo capitalize">← {concept.collection_slug?.replace("-", " and ")}</Link>

      <div className="mt-4 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
        <figure className="card overflow-hidden">
          <div className="aspect-[4/3] bg-line/60">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt={concept.english} className="size-full object-cover" />
            ) : (
              <div className="size-full grid place-items-center text-center p-8 text-muted">
                <div>
                  <div className="font-serif text-6xl text-ink/15">{concept.english}</div>
                  <p className="mt-3 text-sm">No photo yet. Market photos of the real thing are best.</p>
                </div>
              </div>
            )}
          </div>
          {img && (
            <figcaption className="px-4 py-2.5 text-xs text-muted border-t border-line">
              {img.credit}
              {img.source_url && <> · <a href={img.source_url} className="underline" target="_blank" rel="noreferrer">source</a></>}
              {img.license_url && <> · <a href={img.license_url} className="underline" target="_blank" rel="noreferrer">license</a></>}
              {img.ai_generated && <> · AI-generated illustration</>}
            </figcaption>
          )}
        </figure>

        <div>
          <p className="label">Concept</p>
          <h1 className="font-serif text-4xl font-bold capitalize">{concept.english}</h1>
          {concept.gloss && <p className="mt-1 text-muted">{concept.gloss}</p>}

          <div className="mt-6 grid gap-3">
            {languages.map((l) => {
              const names = (concept.lexemes ?? []).filter((x) => x.language === l.code);
              return (
                <div key={l.code} className="card p-4">
                  <div className="flex items-center gap-2">
                    <LangChip code={l.code} />
                    <span className="font-semibold">{l.name}</span>
                    <span className="text-muted text-sm word">· {l.native_name}</span>
                  </div>
                  {names.length ? (
                    <ul className="mt-3 grid gap-2">
                      {names.map((n) => {
                        const voice = audio.find((a) => a.lexeme_id === n.id);
                        return (
                          <li key={n.id} className="flex items-center gap-3 flex-wrap">
                            {voice ? <AudioButton src={voice.url} label={`Hear ${n.form}`} /> : <span className="size-9 grid place-items-center rounded-full border border-dashed border-line text-muted text-xs" title="No recording yet">🎙</span>}
                            <span className="word text-3xl font-semibold">{n.form}</span>
                            <StatusBadge status={n.status} source={n.source} />
                            {n.dialect && <span className="text-xs text-muted">{n.dialect}</span>}
                            {voice?.creator && <span className="text-xs text-muted">voice: {voice.creator}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted">No {l.name} name yet.</p>
                  )}
                  <AddName conceptId={concept.id} language={l.code} languageName={l.name} signedIn={!!viewer.userId}
                    lexemes={names.map((n) => ({ id: n.id, form: n.form }))} />
                </div>
              );
            })}
          </div>

          {sentences.length > 0 && (
            <div className="mt-6">
              <h2 className="font-serif text-xl font-bold">In a sentence</h2>
              <ul className="mt-3 grid gap-2">
                {sentences.map((s) => (
                  <li key={s.id} className="card p-3">
                    <div className="flex items-center gap-2"><LangChip code={s.language} /><span className="word text-lg">{s.text}</span></div>
                    {s.english && <div className="text-sm text-muted mt-1">{s.english}</div>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {concept.cultural_note && <p className="mt-6 card p-4 leading-relaxed">{concept.cultural_note}</p>}
        </div>
      </div>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="font-serif text-2xl font-bold">More in this collection</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {others.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
          </div>
        </section>
      )}
    </div>
  );
}
