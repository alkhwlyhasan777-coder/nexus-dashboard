import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const navigate=useNavigate(); const [ready,setReady]=useState(false); const [checking,setChecking]=useState(true);
  const [password,setPassword]=useState(""); const [confirm,setConfirm]=useState(""); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [done,setDone]=useState(false);
  useEffect(()=>{
    if (!supabase) { setChecking(false); return undefined; }
    let active=true;
    supabase.auth.getSession().then(({data})=>{ if(active){setReady(Boolean(data.session));setChecking(false);} });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY" && active){setReady(Boolean(session));setChecking(false);}
    });
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);
  async function submit(event) {
    event.preventDefault(); setError("");
    if(password.length<8) return setError("Use at least 8 characters.");
    if(password!==confirm) return setError("Passwords do not match.");
    setBusy(true);
    const {error:updateError}=await supabase.auth.updateUser({password});
    setBusy(false);
    if(updateError) return setError(updateError.message);
    setDone(true);
    await supabase.auth.signOut();
  }
  return <AuthShell title="Choose a new password" subtitle="Create a strong password for your Nexus account." footer={<Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400">Back to sign in</Link>}>
    {checking ? <p className="text-center text-sm text-neutral-500">Verifying your recovery link…</p> : done ? <div role="status" className="space-y-3 text-center"><p className="text-sm text-emerald-600">Your password has been updated successfully.</p><button onClick={()=>navigate("/login")} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white">Continue to sign in</button></div> : !ready ? <p role="alert" className="text-sm leading-6 text-red-600">This recovery link is invalid or has expired. <Link to="/forgot-password" className="font-semibold underline">Request a new link</Link>.</p> : <>
      {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]"/></label>
        <label className="block text-sm font-medium">Confirm new password<input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#0b1323]"/></label>
        <button disabled={busy} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white disabled:opacity-50">{busy?"Updating…":"Update password"}</button>
      </form>
    </>}
  </AuthShell>;
}
