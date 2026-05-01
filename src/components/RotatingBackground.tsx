import { useEffect, useState } from "react";

const IMAGES = [
  { src: "/bg/lana-mountain.png", pan: true },
  { src: "/bg/lana-meadow.png", pan: true },
  { src: "/bg/lana-cottage.png", pan: false },
  { src: "/bg/lana-council.png", pan: false },
  { src: "/bg/lana-sky.png", pan: false },
];
const INTERVAL_MS = 8000;

export function RotatingBackground() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % IMAGES.length);
        setFading(false);
      }, 1400);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {IMAGES.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 bg-cover bg-center${img.pan ? " animate-bg-pan" : ""}`}
          style={{
            backgroundImage: `url(${img.src})`,
            opacity: i === current ? (fading ? 0 : 1) : 0,
            transition: "opacity 1.4s ease-in-out",
          }}
          aria-hidden
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/30 to-lana-lavender/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-white/15" />
    </div>
  );
}
