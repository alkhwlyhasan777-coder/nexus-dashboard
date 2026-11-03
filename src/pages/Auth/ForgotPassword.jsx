import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { useUI } from "../../context/UIcontext";
import { AUTH_TEXT, authErrorMessage } from "../../lib/auth.i18n";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
  const { lang } = useUI();
  const t = AUTH_TEXT[lang] || AUTH_TEXT.en;
  const [email,setEmail]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [sent,setSent]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError("");
    if (!supabase) return setError(t.setupPending);
    setBusy(true);
    const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin + "/reset-password" });
    setBusy(false);
    if (requestError) return setError(authErrorMessage(requestError, t, "resetRequestError"));
    setSent(true);
  }
  return <AuthShell title={t.resetTitle} subtitle={t.resetSubtitle} footer={<Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400">{t.backLogin}</Link>}>
    {sent ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">{t.resetSent} <strong dir="ltr">{email}</strong>، {t.resetSentEnd}</p> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">{t.email}<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} dir="ltr" placeholder="you@company.com" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-start outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]"/></label>
        <button disabled={busy} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white disabled:opacity-50">{busy?t.sending:t.sendLink}</button>
      </form>
    </>}
  </AuthShell>;
}
