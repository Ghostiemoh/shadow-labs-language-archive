import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLanguages, getViewer } from "@/lib/data";
import { LangChip } from "@/components/Badges";

export const metadata = { title: "Fix the AI" };

export default async function Tasks({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const [{ userId, profile }, languages] = await Promise.all([getViewer(), getLanguages()]);
  const myLang = lang ?? profile?.languages.find((l) => languages.some((x) => x.code === l)) ?? "ha";

  const intro = (
    <div className="max-w-2xl">
      <p className="label !text-clay">Fix the AI</p>
      <h1 className="display text-[length:var(--step-4)]">Correct the machine. Teach it your language.</h1>
      <p className="mt-3 text-ink/75 leading-relaxed">
        Each task is one sentence an AI translated. Fix the text, record it in your own voice and tick what the AI got wrong.
        A reviewer for your language checks every task before it counts.
      </p>
    </div>
  );

  if (!userId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        {intro}
        <div className="mt-8 card p-6 grid sm:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <div className="text-sm text-muted">Example</div>
            <div className="mt-1 text-lg">“The goat is eating grass.”</div>
            <div className="mt-1 word text-xl text-indigo">Akuya tana cin ciyawa.</div>
          </div>
          <Link href="/login" className="btn btn-primary">Sign in to start</Link>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const [{ data: open }, { data: mine }] = await Promise.all([
    supabase.from("tasks").select("id, source_text, ai_draft, target_language").eq("status", "open").eq("target_language", myLang).order("created_at").limit(50),
    supabase.from("tasks").select("id, source_text, target_language, status").eq("claimed_by", userId).in("status", ["claimed"]).limit(10),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {intro}
      {!profile?.agreement_signed_at && (
        <p className="mt-6 card p-4 bg-ochre/10 text-sm">Accept the contribution agreement on <Link href="/me" className="text-indigo underline">your account page</Link> before submitting tasks.</p>
      )}
      <div className="mt-8 flex flex-wrap gap-2">
        {languages.map((l) => (
          <Link key={l.code} href={`/tasks?lang=${l.code}`} className={`btn !py-1.5 ${myLang === l.code ? "btn-primary" : "btn-ghost"}`}>{l.name}</Link>
        ))}
      </div>

      {(mine ?? []).length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">You started these</h2>
          <ul className="mt-2 grid gap-2">
            {(mine ?? []).map((t) => (
              <li key={t.id}><Link href={`/tasks/${t.id}`} className="card p-3 flex items-center gap-3 hover:border-indigo"><LangChip code={t.target_language} />{t.source_text}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="font-semibold">{(open ?? []).length} open tasks</h2>
        <ul className="mt-3 grid sm:grid-cols-2 gap-3">
          {(open ?? []).map((t) => (
            <li key={t.id}>
              <Link href={`/tasks/${t.id}`} className="card p-4 block hover:border-indigo h-full">
                <div className="flex items-center gap-2 text-xs text-muted"><LangChip code={t.target_language} /> sentence</div>
                <div className="mt-2">{t.source_text}</div>
                {t.ai_draft && <div className="mt-1 word text-indigo/80">{t.ai_draft}</div>}
              </Link>
            </li>
          ))}
        </ul>
        {!(open ?? []).length && <p className="mt-3 text-muted">No open tasks in this language right now.</p>}
      </section>
    </div>
  );
}
