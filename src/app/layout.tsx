import type { Metadata, Viewport } from "next";
import { Charis_SIL, Familjen_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SHOW_DRAFTS } from "@/lib/site";
import { getViewer } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";
import { NavLinks } from "@/components/NavLinks";

// Charis SIL: made by SIL for languages with stacked tone marks and hooked letters.
// The vietnamese subset carries the dot-below vowels (ẹ ọ ụ ị); latin-ext carries ɓ ɗ ƙ.
const charis = Charis_SIL({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "700"], variable: "--font-charis", display: "swap" });
const familjen = Familjen_Grotesk({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-familjen", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${SITE_NAME}: Nigerian languages, word by word`, template: `%s · ${SITE_NAME}` },
  description:
    "A picture dictionary of Hausa, Yoruba and Igbo, written and voiced by native speakers. Every word has a picture, its name in each language, tone marks and a real voice.",
};

export const viewport: Viewport = { themeColor: "#f7f2e8" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getViewer();
  const nav = [
    { href: "/browse", label: "Browse" },
    { href: "/tasks", label: "Fix the AI" },
    { href: "/contribute", label: "Contribute" },
    { href: "/about", label: "About" },
    ...(profile && (profile.role === "reviewer" || profile.role === "admin") ? [{ href: "/review", label: "Review" }] : []),
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ];
  return (
    <html lang="en" className={`${charis.variable} ${familjen.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-3 focus:bg-surface">Skip to content</a>
        <header className="border-b border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 min-h-11" aria-label={`${SITE_NAME} home`}>
              <span className="display text-[1.45rem] tracking-tight">{SITE_NAME}</span>
              <span aria-hidden className="word text-clay text-lg leading-none">ẹ̀</span>
            </Link>
            <nav aria-label="Main" className="hidden md:flex items-center gap-4 text-[0.95rem] text-ink-soft">
              <NavLinks items={nav} variant="desktop" />
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden lg:block w-60"><SearchBox compact /></div>
              {profile ? (
                <Link href="/me" className="btn btn-ghost text-sm">{profile.display_name || "Me"}</Link>
              ) : (
                <Link href="/login" className="btn btn-primary text-sm">Sign in</Link>
              )}
            </div>
          </div>
          {/* Phones: the same links, scrollable, never hidden behind a menu. */}
          <nav aria-label="Main" className="md:hidden border-t border-line overflow-x-auto">
            <div className="flex gap-1 px-3 text-[0.95rem] text-ink-soft whitespace-nowrap">
              <NavLinks items={[...nav, { href: "/search", label: "Search" }]} variant="mobile" />
            </div>
          </nav>
          {SHOW_DRAFTS && (
            <p className="bg-ochre-soft text-[0.85rem] text-ink-soft px-4 py-2 text-center">
              Preview. Names marked <b className="text-ink">AI draft</b> have not yet been checked by a native speaker.
            </p>
          )}
        </header>


        <main id="main" className="flex-1">{children}</main>

        <div className="weave" aria-hidden />
        <footer className="bg-brand-deep text-brand-soft">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-sm">
              <div className="display text-2xl text-surface">{SITE_NAME}</div>
              <p className="mt-3 leading-relaxed text-brand-soft/80">
                Hausa, Yoruba and Igbo first. Fulfulde, Kanuri, Tiv, Ijaw and Efik next, each with its own native-speaker lead.
              </p>
            </div>
            <div className="grid gap-2 content-start">
              <div className="eyebrow !text-brand-soft/60">Use it</div>
              <Link href="/browse" className="hover:text-surface">Browse collections</Link>
              <Link href="/search" className="hover:text-surface">Search</Link>
              <Link href="/about#licenses" className="hover:text-surface">Licences and credits</Link>
            </div>
            <div className="grid gap-2 content-start">
              <div className="eyebrow !text-brand-soft/60">Build it</div>
              <Link href="/contribute" className="hover:text-surface">Become a contributor</Link>
              <Link href="/tasks" className="hover:text-surface">Fix-the-AI tasks</Link>
              <Link href="/about#data" className="hover:text-surface">Data for research and industry</Link>
            </div>
          </div>
          <div className="border-t border-surface/10 text-center py-4 text-xs text-brand-soft/60">A Shadow Labs project · Abuja</div>
        </footer>
      </body>
    </html>
  );
}
