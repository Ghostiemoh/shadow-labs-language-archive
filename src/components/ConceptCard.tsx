import Link from "next/link";
import type { Concept, Language } from "@/lib/types";
import { LangChip } from "./Badges";

// A specimen: picture, then the names. No box around it; the picture and the type carry it.
export function ConceptCard({ concept, languages }: { concept: Concept; languages: Language[] }) {
  const img = concept.media?.find((m) => m.kind === "image");
  return (
    <Link href={`/concept/${concept.slug}`} className="group block">
      <div className="aspect-[4/3] bg-sand relative overflow-hidden rounded-[4px]">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.url} alt={concept.english} loading="lazy" decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]" />
        ) : (
          <div className="size-full grid place-items-center">
            <span className="display text-5xl text-line-strong">{concept.english.slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        {img?.ai_generated && (
          <span className="absolute bottom-2 left-2 rounded-[3px] bg-ink/75 text-surface text-[0.68rem] font-semibold px-1.5 py-0.5">AI image</span>
        )}
      </div>
      <div className="pt-2.5 pb-1">
        <div className="text-[0.82rem] text-muted group-hover:text-indigo">{concept.english}</div>
        <dl className="mt-1 grid gap-0.5">
          {languages.map((l) => {
            const name = concept.lexemes?.find((x) => x.language === l.code);
            return (
              <div key={l.code} className="flex items-baseline gap-2">
                <dt><LangChip code={l.code} /></dt>
                <dd className={name ? `word text-[1.15rem] ${name.status === "approved" ? "text-ink" : "text-ink-soft"}` : "text-[0.8rem] text-muted italic"}>
                  {name ? name.form : "needs a name"}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </Link>
  );
}
