import type { Metadata } from "next";
import { Noto_Sans, Noto_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SHOW_DRAFTS } from "@/lib/site";
import { getViewer } from "@/lib/data";
import { SearchBox } from "@/components/SearchBox";

const sans = Noto_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-noto-sans", display: "swap" });
const serif = Noto_Serif({ subsets: ["latin", "latin-ext"], variable: "--font-noto-serif", weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: `${SITE_NAME}: Nigerian languages, word by word`, template: `%s · ${SITE_NAME}` },
  description:
    "A picture dictionary for Hausa, Yoruba and Igbo, built by native speakers. Every word has a photo, the name in each language, tone marks and the speaker's own voice.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getViewer();
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="min-h-screen flex flex-col">
        {SHOW_DRAFTS && (
          <div className="bg-ochre/15 text-[13px] text-ink/80 text-center px-4 py-1.5 border-b border-line">
            Preview: names marked <span className="font-semibold">draft</span> are AI drafts waiting for a native-speaker reviewer.
          </div>
        )}
        <header className="bg-paper border-b border-line">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span aria-hidden className="grid place-items-center size-9 rounded-full bg-indigo text-white font-serif font-bold text-lg">ẹ</span>
              <span className="font-serif font-bold text-lg tracking-tight">{SITE_NAME}</span>
            </Link>
            <nav className="flex items-center gap-4 text-[15px] text-ink/80 order-3 sm:order-none w-full sm:w-auto overflow-x-auto">
              <Link href="/browse" className="hover:text-indigo">Browse</Link>
              <Link href="/tasks" className="hover:text-indigo">Fix the AI</Link>
              <Link href="/contribute" className="hover:text-indigo">Contribute</Link>
              <Link href="/about" className="hover:text-indigo">About</Link>
              {profile && (profile.role === "reviewer" || profile.role === "admin") && (
                <Link href="/review" className="hover:text-indigo">Review</Link>
              )}
              {profile?.role === "admin" && <Link href="/admin" className="hover:text-indigo">Admin</Link>}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden md:block w-64"><SearchBox compact /></div>
              {profile ? (
                <Link href="/me" className="btn btn-ghost !py-1.5 text-sm">{profile.display_name || "Me"}</Link>
              ) : (
                <Link href="/login" className="btn btn-primary !py-1.5 text-sm">Sign in</Link>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <div className="weave" />
        <footer className="bg-ink text-sand/80 text-sm">
          <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3">
            <div>
              <div className="font-serif text-sand text-lg font-bold">{SITE_NAME}</div>
              <p className="mt-2 leading-relaxed">Hausa, Yoruba and Igbo first. Fulfulde, Kanuri, Tiv, Ijaw, Efik and more next, each with its own native-speaker lead.</p>
            </div>
            <div className="space-y-1.5">
              <div className="text-sand font-semibold">Use it</div>
              <Link href="/browse" className="block hover:text-white">Browse collections</Link>
              <Link href="/search" className="block hover:text-white">Search</Link>
              <Link href="/about#licenses" className="block hover:text-white">Licenses and credits</Link>
            </div>
            <div className="space-y-1.5">
              <div className="text-sand font-semibold">Build it</div>
              <Link href="/contribute" className="block hover:text-white">Become a contributor</Link>
              <Link href="/tasks" className="block hover:text-white">Fix-the-AI tasks</Link>
              <Link href="/about#data" className="block hover:text-white">Data for researchers and companies</Link>
            </div>
          </div>
          <div className="border-t border-white/10 text-center py-4 text-xs text-sand/50">A Shadow Labs project · Abuja</div>
        </footer>
      </body>
    </html>
  );
}
