import Link from "next/link";
import type { Concept, Language } from "@/lib/types";
import { LangChip } from "./Badges";

export function ConceptCard({ concept, languages }: { concept: Concept; languages: Language[] }) {
  const img = concept.media?.find((m) => m.kind === "image");
  return (
    <Link href={`/concept/${concept.slug}`} className="card group overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 transition">
      <div className="aspect-[4/3] bg-line/50 relative overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={concept.english} loading="lazy" className="size-full object-cover group-hover:scale-[1.03] transition duration-500" />
        ) : (
          <div className="size-full grid place-items-center text-muted text-sm">
            <span className="font-serif text-4xl text-ink/20">{concept.english.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
      </div>
      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <div className="text-xs text-muted">{concept.english}</div>
        {languages.map((l) => {
          const name = concept.lexemes?.find((x) => x.language === l.code);
          return (
            <div key={l.code} className="flex items-center gap-2 min-h-6">
              <LangChip code={l.code} />
              {name ? (
                <span className={`word text-[17px] ${name.status === "approved" ? "" : "text-ink/70"}`}>{name.form}</span>
              ) : (
                <span className="text-xs text-muted italic">needs a name</span>
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}
