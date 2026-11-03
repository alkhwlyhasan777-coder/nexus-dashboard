import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const [email,setEmail]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [sent,setSent]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError("");
    if (!supabase) return setError("Supabase is not configured yet.");
    setBusy(true);
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/reset-password" });
    setBusy(false);
    if (requestError) return setError(requestError.message);
    setSent(true);
  }
  return <AuthShell title="Reset your password" subtitle="Enter the email address associated with your account." footer={<Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400">Back to sign in</Link>}>
    {sent ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">If an account exists for {email}, a password reset link will arrive by email. Check your inbox and spam folder.</p> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]"/></label>
        <button disabled={busy} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white disabled:opacity-50">{busy?"Sending link…":"Send reset link"}</button>
      </form>
    </>}
  </AuthShell>;
}
