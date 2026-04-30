import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Sparkles, Check } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

const PRINCIPLES = [
  "ima vsak pravico do dostojnega življenja, ne glede na izhodišče,",
  "ima vsak možnost ustvarjati, prispevati in prejemati,",
  "obilje raste skozi sodelovanje,",
  "resnična vrednost nastaja iz kvalitete, odnosa in zavedanja,",
  "denar je orodje za pretok vrednosti,",
  "skupnost postane močna, ko posameznik prevzame odgovornost zase,",
  "nihče ne izgubi, ko sistem temelji na ravnovesju,",
  "prihodnost pripada modelom, ki vključujejo vse — ne izključujejo.",
];

export default function PravicaDoObilja() {
  const navigate = useNavigate();

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

            <article className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <Sparkles className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  Pravica do <span className="text-gradient-purple">Obilja</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>
                  Vsak človek in vsako bitje ima pravico do življenja v <strong className="text-lana-ink">Obilju</strong>.
                  Obilje je naravno stanje, ki nastane, ko živimo v ravnovesju, sodelovanju in zavedanju.
                </p>
                <p>
                  Vsak izmed nas ima pravico, da denar teče skozi naše življenje tako lahkotno kot dih — z jasnim zavedanjem, da ga je vedno dovolj za vse.
                </p>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-lana-ink">Verjamemo, da:</p>
                  <ul className="space-y-2.5 pl-1">
                    {PRINCIPLES.map((p, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-3 w-1.5 h-1.5 rounded-full bg-lana-purple shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="pt-3 italic text-center font-display text-xl text-lana-ink">
                  Obilje ni nekaj, kar čakamo.
                  <br />
                  Je nekaj, kar skupaj ustvarjamo.
                </p>
              </div>
            </article>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-8 py-4 text-base font-semibold shadow-lg hover:bg-lana-purple/90 transition"
              >
                <Check className="w-5 h-5" />
                Strinjam se
              </button>
            </div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Več. Tvoje.</p>
        </footer>
      </div>
    </>
  );
}
