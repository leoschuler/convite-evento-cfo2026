import BackgroundAtmosphere from "./BackgroundAtmosphere";

/** Tela para convite expirado, cancelado ou inexistente. Nunca erro cru. */
export default function StateScreen({
  eyebrow = "Private Access",
  title,
  support,
  footnote,
}: {
  eyebrow?: string;
  title: string;
  support?: string;
  footnote?: string;
}) {
  return (
    <main className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-6 py-10 md:px-10 md:py-12">
      <BackgroundAtmosphere />

      <div className="relative z-10 flex items-center gap-3">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.36em] text-bone">CFO Insights</span>
        <span className="h-3 w-px bg-line" aria-hidden />
        <span className="label">{eyebrow}</span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[900px] py-20">
        <h1 className="display text-[clamp(1.9rem,5.6vw,4rem)]">{title}</h1>
        {support && <p className="mt-8 max-w-[48ch] text-[1rem] leading-relaxed text-ash">{support}</p>}
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="label">{footnote ?? "Grupo Pomin — Solutta · Auditto"}</span>
        <span className="label">Executive Guest Experience</span>
      </div>
    </main>
  );
}
