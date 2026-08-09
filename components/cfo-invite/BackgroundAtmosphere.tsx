/**
 * Atmosfera: luz volumétrica + grade discreta + grão.
 * Zero JS por opção — a página já gasta main thread com scroll storytelling.
 */
export default function BackgroundAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-void" />

      {/* grade financeira, quase invisível */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff0d 1px, transparent 1px), linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          maskImage: "radial-gradient(120% 90% at 50% 15%, #000 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 50% 15%, #000 0%, transparent 72%)",
        }}
      />

      {/* luz fria superior */}
      <div
        className="absolute -top-[35vh] left-1/2 h-[90vh] w-[130vw] -translate-x-1/2 opacity-60"
        style={{
          background: "radial-gradient(50% 50% at 50% 50%, rgba(126,138,158,0.16) 0%, transparent 70%)",
          animation: "drift-a 26s ease-in-out infinite",
        }}
      />

      {/* luz quente lateral, muito contida */}
      <div
        className="absolute bottom-[-25vh] right-[-15vw] h-[80vh] w-[80vw] opacity-50"
        style={{
          background: "radial-gradient(50% 50% at 50% 50%, rgba(185,165,130,0.12) 0%, transparent 70%)",
          animation: "drift-b 34s ease-in-out infinite",
        }}
      />

      <div className="grain absolute inset-0" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_35%,#050506_100%)]" />
    </div>
  );
}
