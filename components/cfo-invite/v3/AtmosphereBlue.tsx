/**
 * Atmosfera da v3 — o mesmo wash azul das fotos do evento.
 * Zero JS: a página já gasta main thread com scroll storytelling.
 */
export default function AtmosphereBlue() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-night" />

      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(56,207,255,0.10) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,207,255,0.07) 1px, transparent 1px)",
          backgroundSize: "128px 128px",
          maskImage: "radial-gradient(120% 90% at 50% 12%, #000 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 12%, #000 0%, transparent 70%)",
        }}
      />

      <div
        className="absolute -top-[38vh] left-1/2 h-[95vh] w-[135vw] -translate-x-1/2 opacity-70"
        style={{
          background: "radial-gradient(50% 50% at 50% 50%, rgba(10,124,255,0.20) 0%, transparent 70%)",
          animation: "drift-a 28s ease-in-out infinite",
        }}
      />

      <div
        className="absolute bottom-[-28vh] right-[-18vw] h-[85vh] w-[85vw] opacity-60"
        style={{
          background: "radial-gradient(50% 50% at 50% 50%, rgba(56,207,255,0.13) 0%, transparent 70%)",
          animation: "drift-b 36s ease-in-out infinite",
        }}
      />

      <div className="grain absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_32%,#04070d_100%)]" />
    </div>
  );
}
