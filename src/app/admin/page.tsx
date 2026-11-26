import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCollections, getLanguages, getViewer } from "@/lib/data";
import { People, AddConcept, PhotoPicker, BulkTasks } from "./AdminTools";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function Admin() {
  const { profile } = await getViewer();
  if (profile?.role !== "admin") redirect("/");
  const supabase = await createClient();
  const [languages, collections, { data: people }, { data: concepts }] = await Promise.all([
    getLanguages(false), getCollections(),
    supabase.from("profiles").select("*").order("created_at"),
    supabase.from("concepts").select("id, slug, english, media(id, kind, status)").order("english"),
  ]);
  const noPhoto = (concepts ?? []).filter((c) => !(c.media ?? []).some((m) => m.kind === "image" && m.status === "approved"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-10">
      <div>
        <h1 className="display text-[length:var(--step-3)]">Admin</h1>
        <p className="text-muted mt-1">{concepts?.length} concepts · {noPhoto.length} without a photo · {people?.length} people</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn btn-ghost text-sm" href="/export?type=names">Download reviewed names (CSV)</a>
          <a className="btn btn-ghost text-sm" href="/export?type=sentences">Download reviewed sentences (CSV)</a>
          <a className="btn btn-ghost text-sm" href="/export?type=ai_errors">Download AI error report (CSV)</a>
        </div>
      </div>
      <People people={people ?? []} languages={languages} />
      <PhotoPicker concepts={noPhoto.map((c) => ({ id: c.id, slug: c.slug, english: c.english }))} />
      <AddConcept collections={collections} languages={languages.filter((l) => l.active)} />
      <BulkTasks languages={languages.filter((l) => l.active)} />
    </div>
  );
}
