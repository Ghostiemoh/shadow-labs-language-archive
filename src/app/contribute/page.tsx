import Link from "next/link";

export const metadata = { title: "Contribute" };

const ROLES = [
  { t: "Speaker", d: "Add names you know, with tone marks and your dialect. Record them in your voice." },
  { t: "Fix-the-AI", d: "Correct AI translations, read them aloud, tag the mistakes. Paid per accepted task." },
  { t: "Reviewer", d: "Strong contributors become reviewers for their language and check everyone's work." },
  { t: "Language lead", d: "One per language. Owns quality, trains reviewers and grows the word list." },
];

export default function Contribute() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="label !text-clay">Contribute</p>
      <h1 className="font-serif text-4xl font-bold max-w-3xl">Your language, in your voice, credited to you.</h1>
      <p className="mt-4 text-lg text-ink/75 max-w-2xl leading-relaxed">
        We are building the most careful record of Nigerian languages anywhere, starting with Hausa, Yoruba and Igbo.
        Everything is checked by a native speaker before it goes live, and contributors are paid for accepted work.
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        {ROLES.map((r) => (
          <div key={r.t} className="card p-5"><div className="font-semibold text-lg">{r.t}</div><p className="mt-1 text-ink/75">{r.d}</p></div>
        ))}
      </div>
      <div className="mt-10 card p-6 grid gap-3">
        <h2 className="font-serif text-2xl font-bold">How to start</h2>
        <ol className="list-decimal pl-5 grid gap-1.5 text-ink/80">
          <li>Create an account and tick the languages you speak natively.</li>
          <li>Read and accept the contribution agreement (consent, rights, payment).</li>
          <li>Pick a Fix-the-AI task, or open any word and add or record its name.</li>
          <li>A reviewer for your language checks it. Accepted items count toward your monthly payout.</li>
        </ol>
        <div className="flex gap-3 mt-2"><Link href="/login" className="btn btn-primary">Create an account</Link><Link href="/tasks" className="btn btn-ghost">See the tasks</Link></div>
      </div>
      <p className="mt-8 text-sm text-muted">Speak Fulfulde, Kanuri, Tiv, Ijaw, Efik or another Nigerian language and want to lead it? Sign up and tick it. Each new language opens with its own native-speaker lead.</p>
    </div>
  );
}
