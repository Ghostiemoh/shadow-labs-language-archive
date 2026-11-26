import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLanguages, getViewer } from "@/lib/data";
import { TaskEditor } from "./TaskEditor";

export const metadata = { title: "Task" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, profile } = await getViewer();
  if (!userId) redirect("/login");
  const supabase = await createClient();
  const { data: task } = await supabase.from("tasks").select("*, concepts(slug, english, media(url, kind, status))").eq("id", id).maybeSingle();
  if (!task) notFound();
  const languages = await getLanguages();
  const lang = languages.find((l) => l.code === task.target_language);
  const img = task.concepts?.media?.find((m: { kind: string; status: string }) => m.kind === "image" && m.status === "approved");
  const { data: next } = await supabase.from("tasks").select("id").eq("status", "open").eq("target_language", task.target_language).neq("id", id).limit(1).maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/tasks?lang=${task.target_language}`} className="text-sm text-indigo">← All {lang?.name} tasks</Link>
      <div className="mt-4 card overflow-hidden">
        <div className="grid sm:grid-cols-[180px_1fr]">
          <div className="bg-line/60 aspect-square sm:aspect-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img && <img src={img.url} alt="" className="size-full object-cover" />}
          </div>
          <div className="p-5">
            <p className="label">Translate into {lang?.name}</p>
            <p className="mt-2 display text-[length:var(--step-2)]">“{task.source_text}”</p>
            {task.concepts && <Link href={`/concept/${task.concepts.slug}`} className="mt-2 inline-block text-sm text-indigo">Concept: {task.concepts.english}</Link>}
          </div>
        </div>
      </div>
      <TaskEditor
        task={task}
        languageName={lang?.name ?? task.target_language}
        userId={userId}
        agreementSigned={!!profile?.agreement_signed_at}
        nextId={next?.id ?? null}
      />
    </div>
  );
}
