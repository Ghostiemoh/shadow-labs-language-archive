"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const supabase = createClient();
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else { router.push("/me"); router.refresh(); }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { display_name: name }, emailRedirectTo: `${location.origin}/auth/callback?next=/me` },
      });
      if (error) setMsg(error.message);
      else if (data.session) { router.push("/me"); router.refresh(); }
      else setMsg("Check your email for a confirmation link, then come back and sign in.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="display text-[length:var(--step-3)]">{mode === "in" ? "Sign in" : "Join as a contributor"}</h1>
      <p className="mt-2 text-muted">{mode === "in" ? "Welcome back." : "Add names, record your voice and fix AI translations in your language."}</p>
      <form onSubmit={submit} className="mt-6 card p-5 grid gap-4">
        {mode === "up" && (
          <label className="grid gap-1"><span className="label">Name shown on your recordings</span>
            <input className="input" required autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} /></label>
        )}
        <label className="grid gap-1"><span className="label">Email</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <div className="grid gap-1">
          <label htmlFor="password" className="label">Password{mode === "up" && " (at least 8 characters)"}</label>
          <div className="relative">
            <input id="password" className="input pr-12" type={show ? "text" : "password"} required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
              className="absolute right-0 top-0 size-11 grid place-items-center text-muted hover:text-ink">
              {show ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
            </button>
          </div>
        </div>
        {msg && <p role="alert" className="text-sm text-clay-deep">{msg}</p>}
        <button disabled={busy} className="btn btn-primary justify-center">{busy ? (mode === "in" ? "Signing in…" : "Creating account…") : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="mt-4 btn btn-ghost text-sm">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
