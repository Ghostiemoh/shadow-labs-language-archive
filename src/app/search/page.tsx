import { getLanguages, search } from "@/lib/data";
import { ConceptCard } from "@/components/ConceptCard";
import { SearchBox } from "@/components/SearchBox";

export const metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const [results, languages] = await Promise.all([search(q), getLanguages()]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="max-w-2xl"><SearchBox defaultValue={q} /></div>
      <p className="mt-3 text-sm text-muted">Tone marks are optional: <span className="word">ewure</span> finds <span className="word">ewúrẹ́</span>.</p>
      {q && (
        <h1 className="mt-8 font-serif text-2xl font-bold">
          {results.length ? `${results.length} result${results.length > 1 ? "s" : ""} for “${q}”` : `Nothing found for “${q}” yet`}
        </h1>
      )}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((c) => <ConceptCard key={c.id} concept={c} languages={languages} />)}
      </div>
    </div>
  );
}
