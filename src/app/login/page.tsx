"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></label>
        )}
        <label className="grid gap-1"><span className="label">Email</span>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="grid gap-1"><span className="label">Password</span>
          <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "in" ? "current-password" : "new-password"} /></label>
        {msg && <p className="text-sm text-clay">{msg}</p>}
        <button disabled={busy} className="btn btn-primary justify-center">{busy ? "…" : mode === "in" ? "Sign in" : "Create account"}</button>
      </form>
      <button onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="mt-4 text-sm text-indigo">
        {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
