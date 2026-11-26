// Skeleton shown while a page's data loads. Keeps layout stable on slow connections.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10" role="status" aria-label="Loading">
      <div className="h-4 w-40 rounded bg-sand animate-pulse motion-reduce:animate-none" />
      <div className="mt-4 h-10 w-2/3 max-w-xl rounded bg-sand animate-pulse motion-reduce:animate-none" />
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/3] rounded-[4px] bg-sand animate-pulse motion-reduce:animate-none" />
            <div className="mt-3 h-3 w-1/3 rounded bg-sand" />
            <div className="mt-2 h-4 w-2/3 rounded bg-sand" />
            <div className="mt-1.5 h-4 w-1/2 rounded bg-sand" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
