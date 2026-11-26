"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Main navigation with the current section marked (aria-current + underline), same links on every screen size.
export function NavLinks({ items, variant }: { items: { href: string; label: string }[]; variant: "desktop" | "mobile" }) {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");
  const base = variant === "desktop"
    ? "inline-flex items-center min-h-11 px-1 border-b-2"
    : "inline-flex items-center min-h-11 px-2.5 border-b-2";
  return (
    <>
      {items.map((n) => (
        <Link key={n.href} href={n.href} aria-current={active(n.href) ? "page" : undefined}
          className={`${base} ${active(n.href) ? "border-brand text-ink font-semibold" : "border-transparent hover:text-brand"}`}>
          {n.label}
        </Link>
      ))}
    </>
  );
}
