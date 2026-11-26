"use client";
import Link from "next/link";
import { useEffect } from "react";

// Shown when a page fails (e.g. the database is unreachable on a weak connection).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display mt-3 text-[length:var(--step-3)]">This page didn&apos;t load.</h1>
      <p className="mt-3 text-ink-soft">It may be your connection or ours. Your recordings and edits already sent are safe.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-ghost">Go home</Link>
      </div>
    </div>
  );
}
