import Link from "next/link";
import { getCollections, getConcepts, getLanguages } from "@/lib/data";
import { ConceptCard } from "@/components/ConceptCard";

export const revalidate = 60;
export const metadata = { title: "Browse" };

export default async function Browse() {
  const [collections, concepts, languages] = await Promise.all([getCollections(), getConcepts(), getLanguages()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="display text-[length:var(--step-4)]">Browse</h1>
      <p className="mt-2 text-muted">{concepts.length} concepts in {collections.length} collections.</p>
      {collections.map((col) => {
        const items = concepts.filter((c) => c.collection_slug === col.slug);
        return (
          <section key={col.slug} className="mt-10">
            <div className="flex items-end justify-between">
              <h2 className="display text-[length:var(--step-2)]">{col.name} <span className="text-muted text-base font-normal">· {items.length}</span></h2>
              <Link href={`/browse/${col.slug}`} className="text-brand text-sm font-semibold">See all →</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.slice(0, 10).map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
