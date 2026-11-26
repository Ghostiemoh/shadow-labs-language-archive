import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollections, getConcepts, getLanguages } from "@/lib/data";
import { ConceptCard } from "@/components/ConceptCard";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const col = (await getCollections()).find((c) => c.slug === collection);
  return { title: col?.name ?? "Collection" };
}

export default async function CollectionPage({ params, searchParams }: {
  params: Promise<{ collection: string }>; searchParams: Promise<{ missing?: string }>;
}) {
  const { collection } = await params;
  const { missing } = await searchParams;
  const [collections, languages] = await Promise.all([getCollections(), getLanguages()]);
  const col = collections.find((c) => c.slug === collection);
  if (!col) notFound();
  let concepts = await getConcepts(collection);
  if (missing) concepts = concepts.filter((c) => !c.lexemes?.some((l) => l.language === missing));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/browse" className="text-sm text-indigo">← All collections</Link>
      <h1 className="mt-2 display text-[length:var(--step-4)]">{col.name}</h1>
      <p className="mt-2 text-muted">{col.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <Link href={`/browse/${collection}`} className={`btn !py-1 ${!missing ? "btn-primary" : "btn-ghost"}`}>All</Link>
        {languages.map((l) => (
          <Link key={l.code} href={`/browse/${collection}?missing=${l.code}`} className={`btn !py-1 ${missing === l.code ? "btn-primary" : "btn-ghost"}`}>
            Missing {l.name}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {concepts.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
      </div>
      {!concepts.length && <p className="mt-10 text-muted">Nothing here yet.</p>}
    </div>
  );
}
