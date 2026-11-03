import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f5f7fb] px-4 py-10 text-neutral-900 dark:bg-[#090f1e] dark:text-white sm:px-6">
      <div className="pointer-events-none absolute -start-32 -top-32 size-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -end-24 size-[28rem] rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative m-auto w-full max-w-md">
        <Link to="/login" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[#14284b] text-lg font-bold text-white shadow-lg shadow-blue-950/15">N</span>
          <span className="text-xl font-semibold tracking-tight">Nex<span className="text-orange-500">us</span></span>
        </Link>
        <section className="rounded-3xl border border-neutral-200/80 bg-white/95 p-6 shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#111a2c] sm:p-8">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          </div>
          {children}
          {footer && <div className="mt-6 border-t border-neutral-200 pt-5 text-center text-sm text-neutral-500 dark:border-white/10 dark:text-neutral-400">{footer}</div>}
        </section>
        <p className="mt-6 text-center text-xs text-neutral-400">Secure workspace · Nexus Dashboard</p>
      </div>
    </main>
  );
}
