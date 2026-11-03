import { useState } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { useUI } from "../../context/UIcontext";
import { AUTH_TEXT, authErrorMessage } from "../../lib/auth.i18n";
import { supabase } from "../../lib/supabase";

export default function Signup() {
  const { lang } = useUI();
  const t = AUTH_TEXT[lang] || AUTH_TEXT.en;
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [sent,setSent]=useState(false); const [show,setShow]=useState(false);
  async function submit(event) {
    event.preventDefault(); setError("");
    if (!supabase) return setError(t.setupPending);
    if (password.length < 8) return setError(t.passwordLength);
    if (password !== confirm) return setError(t.passwordsMismatch);
    setBusy(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: window.location.origin + "/login" },
    });
    setBusy(false);
    if (authError) return setError(authErrorMessage(authError, t, "signupError"));
    setSent(true);
  }
  return <AuthShell title={t.createTitle} subtitle={t.createSubtitle} footer={<span>{t.already} <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400">{t.signIn}</Link></span>}>
    {sent ? <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm leading-6 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"><div className="mb-2 text-lg font-semibold">{t.checkInbox}</div>{t.confirmationSent} <strong dir="ltr">{email}</strong>. {t.confirmEmail}</div> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">{t.fullName}<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder={t.yourName}/></label>
        <label className="block text-sm font-medium">{t.workEmail}<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-start outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder="you@company.com"/></label>
        <label className="block text-sm font-medium">{t.password}<input required minLength={8} type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-start outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder={t.minPassword}/></label>
        <label className="block text-sm font-medium">{t.confirmPassword}<input required minLength={8} type={show?"text":"password"} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 text-start outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]" placeholder={t.repeatPassword}/></label>
        <label className="flex items-center gap-2 text-xs text-neutral-500"><input type="checkbox" checked={show} onChange={e=>setShow(e.target.checked)}/> {t.showPasswords}</label>
        <button disabled={busy} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white transition hover:bg-[#1c3969] disabled:opacity-50">{busy?t.creating:t.create}</button>
      </form>
    </>}
  </AuthShell>;
}
