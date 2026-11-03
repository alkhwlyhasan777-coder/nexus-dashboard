import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [sent,setSent]=useState(false); const [show,setShow]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError("");
    if (!supabase) return setError("Supabase is not configured yet.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + "/login" },
    });
    setBusy(false);
    if (authError) return setError(authError.message);
    setSent(true);
  }
  return <AuthShell title="Create your account" subtitle="Start organizing your work with Nexus Dashboard." footer={<span>Already have an account? <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400">Sign in</Link></span>}>
    {sent ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm leading-6 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"><div className="mb-2 text-lg font-semibold">Check your inbox</div>We sent a confirmation link to <strong>{email}</strong>. Confirm your email to activate your account.</div> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Full name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder="Your name"/></label>
        <label className="block text-sm font-medium">Work email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder="you@company.com"/></label>
        <label className="block text-sm font-medium">Password<input required minLength={8} type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder="At least 8 characters"/></label>
        <label className="block text-sm font-medium">Confirm password<input required minLength={8} type={show?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder="Repeat your password"/></label>
        <label className="flex items-center gap-2 text-xs text-neutral-500"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/> Show passwords</label>
        <button disabled={busy} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white transition hover:bg-[#1c3969] disabled:opacity-50">{busy?"Creating account…":"Create account"}</button>
      </form>
    </>}
  </AuthShell>;
}
