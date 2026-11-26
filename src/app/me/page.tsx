import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLanguages, getViewer } from "@/lib/data";
import { ProfileForm } from "./ProfileForm";

export const metadata = { title: "My account" };

export default async function Me() {
  const { userId, email, profile } = await getViewer();
  if (!userId || !profile) redirect("/login");
  const supabase = await createClient();
  const [languages, { data: reviews }, { data: tasks }, { data: payouts }] = await Promise.all([
    getLanguages(false),
    supabase.from("reviews").select("decision").eq("contributor_id", userId),
    supabase.from("tasks").select("id, status, source_text, target_language").eq("claimed_by", userId).order("submitted_at", { ascending: false }).limit(20),
    supabase.from("payouts").select("*").eq("contributor_id", userId).order("created_at", { ascending: false }),
  ]);
  const accepted = (reviews ?? []).filter((r) => r.decision === "approved").length;
  const decided = (reviews ?? []).length;
  const rate = decided ? Math.round((accepted / decided) * 100) : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{profile.role}</p>
          <h1 className="display text-[length:var(--step-3)]">{profile.display_name}</h1>
          <p className="text-muted text-sm">{email}</p>
        </div>
        <form action="/auth/signout" method="post"><button className="btn btn-ghost">Sign out</button></form>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Box n={accepted} label="accepted items" />
        <Box n={decided - accepted} label="sent back" />
        <Box n={rate === null ? "–" : `${rate}%`} label="acceptance rate" />
      </div>

      {!profile.agreement_signed_at && (
        <div className="card p-5 border-ochre bg-ochre/10">
          <h2 className="font-semibold">Before your first upload</h2>
          <p className="text-sm mt-1 text-ink/80">Read and accept the contribution agreement below. It covers consent for your voice, the right to publish and license what you send, and how payment works.</p>
        </div>
      )}

      <ProfileForm profile={profile} languages={languages} />

      <section>
        <h2 className="display text-[length:var(--step-1)]">My Fix-the-AI tasks</h2>
        {(tasks ?? []).length ? (
          <ul className="mt-3 grid gap-2">
            {(tasks ?? []).map((t) => (
              <li key={t.id} className="card p-3 flex items-center justify-between gap-3">
                <Link href={`/tasks/${t.id}`} className="hover:text-brand">{t.source_text}</Link>
                <span className="text-xs uppercase font-semibold text-muted">{t.target_language} · {t.status}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-muted text-sm">None yet. <Link className="text-brand" href="/tasks">Pick one →</Link></p>}
      </section>

      {(payouts ?? []).length > 0 && (
        <section>
          <h2 className="display text-[length:var(--step-1)]">Payouts</h2>
          <ul className="mt-3 grid gap-2">
            {(payouts ?? []).map((p) => (
              <li key={p.id} className="card p-3 flex justify-between"><span>{p.period} · {p.item_count} items</span><span>₦{Number(p.amount_ngn).toLocaleString()} · {p.status}</span></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Box({ n, label }: { n: number | string; label: string }) {
  return <div className="card p-4"><div className="display text-[length:var(--step-3)] text-brand">{n}</div><div className="text-sm text-muted">{label}</div></div>;
}
