import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="display text-6xl text-brand">404</div>
      <p className="mt-3 text-muted">That page doesn&apos;t exist, or the word hasn&apos;t been added yet.</p>
      <Link href="/" className="btn btn-primary mt-6">Home</Link>
    </div>
  );
}
