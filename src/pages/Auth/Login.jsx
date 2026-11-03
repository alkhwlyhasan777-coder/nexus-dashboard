import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!supabase) return setError("Supabase is not configured yet. Add the project environment variables.");
    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (authError) return setError(authError.message);
    navigate(location.state?.from?.pathname || "/", { replace: true });
  }

  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your workspace." footer={<span>New to Nexus? <Link className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400" to="/signup">Create an account</Link></span>}>
    {!configured && <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">Supabase setup is pending. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.</p>}
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium">Email address<input type="email" autoComplete="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@company.com" className="mt-2 h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0b1323]" /></label>
      <label className="block text-sm font-medium">Password<div className="relative mt-2"><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Enter your password" className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-3 pe-16 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-[#0b1323]" /><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute inset-y-0 end-3 text-xs font-semibold text-blue-600">{showPassword ? "Hide" : "Show"}</button></div></label>
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">Forgot password?</Link></div>
      <button disabled={busy || !configured} className="h-11 w-full rounded-xl bg-[#14284b] text-sm font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-[#1c3969] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  </AuthShell>;
}
