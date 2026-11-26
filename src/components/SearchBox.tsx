export function SearchBox({ compact = false, defaultValue = "" }: { compact?: boolean; defaultValue?: string }) {
  const id = compact ? "q-top" : "q-main";
  return (
    <form action="/search" role="search" className="relative">
      <label htmlFor={id} className="sr-only">Search in Hausa, Yoruba, Igbo or English</label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={compact ? "Search a word" : "akuya, ewúrẹ́, ewu or goat"}
        className={`input word ${compact ? "!py-1.5 text-[0.95rem]" : "!min-h-14 !text-xl pl-4 pr-28"}`}
        autoComplete="off"
        enterKeyHint="search"
      />
      {!compact && <button className="btn btn-primary absolute right-1.5 top-1.5 !min-h-11">Search</button>}
    </form>
  );
}
