import { useEffect, useState } from "react";

const IMAGES = [
  "/bg/1.png",
  "/bg/2.png",
  "/bg/3.png",
  "/bg/4.png",
  "/bg/5.png",
];

const ROTATE_MS = 7000;

export function RotatingBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % IMAGES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {IMAGES.map((src, idx) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity ease-in-out animate-bg-pan"
          style={{
            backgroundImage: `url(${src})`,
            opacity: idx === active ? 1 : 0,
            transitionDuration: "1400ms",
          }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/30 to-lana-lavender/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/15" />
    </div>
  );
}
