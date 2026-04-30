import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Sparkles } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

export default function Lana8Wonder() {
  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        <header className="px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition">
            <LanaLogo />
          </Link>
          <a
            href={APP_LOGIN_URL}
            className="inline-flex items-center gap-2 rounded-full bg-white/75 backdrop-blur-md border border-white/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-white transition"
          >
            <LogIn className="w-4 h-4 text-lana-purple" />
            Prijava
          </a>
        </header>

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition">
              <ArrowLeft className="w-4 h-4" /> Nazaj
            </Link>

            <article className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden text-center">
              <Sparkles className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <div className="flex items-center justify-center gap-2 opacity-60 mb-4">
                <div className="h-px w-12 bg-foreground/30" />
                <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                <div className="h-px w-12 bg-foreground/30" />
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                Lana<span className="text-gradient-purple">8Wonder</span>
              </h1>

              <p className="text-foreground/70 leading-relaxed max-w-md mx-auto">
                Informacije o Lana8Wonder načrtu prihajajo kmalu.
              </p>

              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-8 py-4 text-base font-semibold shadow-lg hover:bg-lana-purple/90 transition"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Nazaj na začetek
                </Link>
              </div>
            </article>
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Varno. Tvoje.</p>
        </footer>
      </div>
    </>
  );
}
