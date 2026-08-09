import Link from "next/link";
import BackgroundAtmosphere from "@/components/cfo-invite/BackgroundAtmosphere";
import { getInvitation, listInvitationSlugs } from "@/lib/invitations.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const dev = process.env.NODE_ENV !== "production";
  const slugs = dev ? await listInvitationSlugs() : [];
  const invites = await Promise.all(slugs.map((s) => getInvitation(s)));

  return (
    <main className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 py-10 md:px-10 md:py-12">
      <BackgroundAtmosphere />

      <div className="relative z-10 flex items-center gap-3">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.36em] text-bone">CFO Insights</span>
        <span className="h-3 w-px bg-line" aria-hidden />
        <span className="label">Private Access</span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[900px] py-16">
        <h1 className="display text-[clamp(1.9rem,5.6vw,4rem)]">Esta página é acessível apenas por convite.</h1>
        <p className="mt-8 max-w-[48ch] text-[1rem] leading-relaxed text-ash">
          Cada convidado do CFO Insights recebe um endereço individual. Use o link enviado pelo seu contato no Grupo
          Pomin.
        </p>

        {dev && (
          <div className="mt-16">
            <div className="label mb-6">Ambiente de desenvolvimento — convites de teste</div>
            <ul className="grid gap-px border-t border-line/60">
              {invites.filter(Boolean).map((i) => (
                <li
                  key={i!.invite_slug}
                  className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line/60 py-4"
                >
                  <Link
                    href={`/guest/${i!.invite_slug}`}
                    className="font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors hover:text-platinum"
                  >
                    {i!.invite_slug}
                  </Link>
                  <div className="flex items-center gap-5">
                    <span className="label">
                      {i!.invite_tier} · {i!.invite_status}
                    </span>
                    <Link href={`/v1/guest/${i!.invite_slug}`} className="label transition-colors hover:text-cyan">
                      v1
                    </Link>
                    <Link href={`/v2/guest/${i!.invite_slug}`} className="label transition-colors hover:text-cyan">
                      v2
                    </Link>
                  </div>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-3 border-b border-line/60 py-4">
                <Link
                  href="/guest/slug-inexistente"
                  className="font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors hover:text-platinum"
                >
                  slug-inexistente
                </Link>
                <span className="label">Invalid slug</span>
              </li>
            </ul>
            <p className="label mt-6 leading-[1.8]">
              /guest/[slug] = v3 (fotografia real do evento) · /v1 e /v2 preservadas para comparação
            </p>
          </div>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="label">Grupo Pomin — Solutta · Auditto</span>
        <span className="label">Executive Guest Experience</span>
      </div>
    </main>
  );
}
