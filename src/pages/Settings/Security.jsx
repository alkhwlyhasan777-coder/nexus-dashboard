import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIcontext";
import { AUTH_TEXT, authErrorMessage } from "../../lib/auth.i18n";
import { supabase } from "../../lib/supabase";

export default function Security() {
  const { user } = useAuth();
  const { lang } = useUI();
  const t = AUTH_TEXT[lang] || AUTH_TEXT.en;
  const [current,setCurrent]=useState(""); const [next,setNext]=useState(""); const [confirm,setConfirm]=useState("");
  const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState("");
  async function submit(event) {
    event.preventDefault(); setError(""); setSuccess("");
    if(next.length<8) return setError(t.newPasswordRequired);
    if(next!==confirm) return setError(t.newPasswordsMismatch);
    if(!supabase) return setError(t.setupPending);
    setBusy(true);
    const {error:updateError}=await supabase.auth.updateUser({password:next,current_password:current});
    setBusy(false);
    if(updateError) return setError(authErrorMessage(updateError, t));
    setCurrent("");setNext("");setConfirm("");setSuccess(t.passwordChanged);
  }
  return <div lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="mx-auto max-w-3xl space-y-6">
    <header><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{t.securityLabel}</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">{t.securityTitle}</h1><p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.securitySubtitle}</p></header>
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <div className="mb-5"><h2 className="font-semibold">{t.changePassword}</h2><p className="mt-1 text-sm text-neutral-500">{t.signedInAs} <bdi>{user?.email}</bdi></p></div>
      {error&&<p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      {success&&<p role="status" className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{success}</p>}
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <label className="block text-sm font-medium">{t.currentPassword}<input required type="password" autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-start outline-none focus:border-blue-500 dark:border-neutral-700"/></label>
        <label className="block text-sm font-medium">{t.newPassword}<input required minLength={8} type="password" autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)} dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-start outline-none focus:border-blue-500 dark:border-neutral-700"/></label>
        <label className="block text-sm font-medium">{t.confirmPassword}<input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} dir="ltr" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-transparent px-3 text-start outline-none focus:border-blue-500 dark:border-neutral-700"/></label>
        <button disabled={busy} className="h-10 rounded-xl bg-[#14284b] px-5 text-sm font-semibold text-white disabled:opacity-50">{busy?t.saving:t.savePassword}</button>
      </form>
    </section>
  </div>;
}
