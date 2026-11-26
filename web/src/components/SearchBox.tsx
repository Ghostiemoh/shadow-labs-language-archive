export function SearchBox({ compact = false, defaultValue = "" }: { compact?: boolean; defaultValue?: string }) {
  return (
    <form action="/search" role="search" className="relative">
      <label htmlFor={compact ? "q-top" : "q-main"} className="sr-only">Search in any language</label>
      <input
        id={compact ? "q-top" : "q-main"}
        name="q"
        defaultValue={defaultValue}
        placeholder={compact ? "Search: akuya, ewúrẹ́, ewu…" : "Type a word in Hausa, Yoruba, Igbo or English"}
        className={`input ${compact ? "!py-1.5 text-sm !rounded-full pl-4" : "!py-3.5 !text-lg !rounded-full pl-5 pr-28 shadow-sm"}`}
        autoComplete="off"
      />
      {!compact && <button className="btn btn-primary absolute right-1.5 top-1.5">Search</button>}
    </form>
  );
}
