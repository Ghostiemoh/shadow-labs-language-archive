import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email confirmation links land here.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/me";
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(next.startsWith("/") ? next : "/me", url.origin));
}
