const BACKGROUND_IMAGE = "/bg/lana-gold.png";

export function RotatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center animate-bg-pan"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/30 to-lana-lavender/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/15" />
    </div>
  );
}
