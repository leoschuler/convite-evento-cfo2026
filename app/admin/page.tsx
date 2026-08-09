import type { Metadata } from "next";
import { isAuthenticated, isConfigured } from "@/lib/admin-auth";
import { readInvitations } from "@/lib/invitations.server";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminPanel from "@/components/admin/AdminPanel";

export const dynamic = "force-dynamic";

/** Nunca indexado e nunca linkado a partir das páginas de convite. */
export const metadata: Metadata = {
  title: "Painel interno — CFO Insights",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  if (!isConfigured()) {
    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-night px-6">
        <div className="max-w-[460px]">
          <div className="font-mono text-[0.66rem] uppercase tracking-[0.34em] text-frost">CFO Insights</div>
          <h1 className="mt-6 text-[1.4rem] tracking-[-0.02em] text-frost">Painel não configurado.</h1>
          <p className="mt-5 text-sm leading-relaxed text-frost/60">
            Defina <code className="text-cyan">ADMIN_PASSWORD</code> (mínimo 8 caracteres) no arquivo{" "}
            <code className="text-cyan">.env.local</code> e reinicie o servidor.
          </p>
          <pre className="mt-6 border border-edge p-4 text-[0.78rem] text-frost/70">ADMIN_PASSWORD=suasenhaforte</pre>
        </div>
      </main>
    );
  }

  if (!(await isAuthenticated())) return <AdminLogin />;

  return <AdminPanel initial={await readInvitations()} />;
}
