export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 leading-relaxed">
      <h1 className="display text-[length:var(--step-4)]">About</h1>
      <p className="mt-4 text-lg text-ink/80">
        AI tools handle Nigerian languages badly: wrong tones, wrong dialect, literal translations, no native audio.
        The open data that exists is mostly news and religious text. This project builds the missing piece:
        verified, structured language data, collected through a free picture dictionary that anyone can use.
      </p>
      <h2 className="mt-10 display text-[length:var(--step-2)]">Concepts, not English words</h2>
      <p className="mt-2 text-ink/80">
        Every entry is a concept with a photo. Each language attaches its own names, tone marks, dialect variants,
        sentences and recordings to it. That is why Hausa to Igbo works without going through English, and why adding a
        new language means adding names to the same concepts.
      </p>
      <h2 className="mt-10 display text-[length:var(--step-2)]">AI drafts, humans decide</h2>
      <p className="mt-2 text-ink/80">
        AI suggests drafts. Native speakers correct them and a reviewer for that language approves them.
        Until then they are marked as drafts. AI is never the final word here.
      </p>
      <h2 id="licenses" className="mt-10 display text-[length:var(--step-2)]">Licenses and credits</h2>
      <p className="mt-2 text-ink/80">
        Every photo and recording carries its license, source and credit, shown under it. Photos come from openly licensed
        sources (Wikimedia Commons, iNaturalist under CC0, CC BY or CC BY-SA) and our own market photography.
        Recordings are made by contributors under a signed contribution agreement.
      </p>
      <h2 id="data" className="mt-10 display text-[length:var(--step-2)]">For researchers and companies</h2>
      <p className="mt-2 text-ink/80">
        Reviewed names, parallel sentences, speech recordings tagged by dialect, and reports on where AI translation fails
        in each language are available as licensed datasets. We also run custom collections and can refer vetted
        native-speaker translators, subtitlers and voice artists.
      </p>
      <p className="mt-8 text-sm text-muted">A Shadow Labs project, Abuja.</p>
    </div>
  );
}
