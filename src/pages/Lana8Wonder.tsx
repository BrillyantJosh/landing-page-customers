import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Star, ExternalLink } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

const PARAGRAPHS = [
  "Lana8Wonder je zasnovana tako, da dolgoročno vsakega posameznika v Novi Realnosti pripelje do točke, kjer premoženje njegove osebne denarnice zraste do ravni, ki mu omogoča življenje z najboljšim od najboljšega.",
  "Te denarnice imajo posebno strukturo. Čeprav na prvi pogled delujejo, kot da vsaka zase vsebuje veliko premoženje, je resnica drugačna — seštevek vseh izgrajenih Lana8Wonder denarnic je vedno enak nič.",
  "Njihovo delovanje lahko primerjamo z morsko gladino. Ko je morje mirno, je gladina na izhodiščni točki nič. Ko nastanejo valovi, je en val +10 cm, drugi pa −10 cm. Nato gravitacija en val spusti in drugega dvigne. Podobno kot zrak, ki si ga vsi izmenjujemo, tudi te denarnice delujejo kot uravnotežen sistem.",
  "Vsak posameznik ima tako na voljo dovolj sredstev za stvari, ki ga v življenju veselijo, hkrati pa skupna vrednost ostaja uravnotežena. V tej ekonomiji vrednost ni nekaj, kar bi neskončno raslo ali padalo — preprosto je. Zato ta sistem ne temelji na klasični gospodarski rasti, temveč na ravnovesju.",
  "Lana8Wonder denarnica potrebuje čas, da zraste. Pridobite jo tako, da v protivrednosti 100 € v Lani zaklenete sredstva v Lana8Wonder, ki se nato postopoma vzpostavlja. Če vam do tega zneska zmanjka, lahko razliko dokupite, opravite nakup v sistemu ali pa preprosto počakate nekaj Splitov, da vrednost sama doseže 100 €. Izbira je vaša.",
  "Pomembno je tudi, da nihče ne more v Lana8Wonder vložiti več kot ta znesek, prav tako ni mogoče preskočiti časa. Tako kot rastlina potrebuje čas, da zraste, tudi vaša denarnica raste postopoma. Prej kot jo »posadite«, prej bo dosegla svoj polni potencial.",
];

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
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" /> Nazaj
            </button>

            <article className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <Star className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  Lana<span className="text-gradient-purple">8Wonder</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                {PARAGRAPHS.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pb-4">
              <a
                href="https://www.lana8wonder.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lana-purple text-white px-8 py-4 text-base font-semibold shadow-lg hover:bg-lana-purple/90 transition"
              >
                <ExternalLink className="w-5 h-5" />
                Obišči lana8wonder.com
              </a>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-8 py-4 text-base font-semibold transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Nazaj
              </button>
            </div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Lepo. Tvoje.</p>
        </footer>
      </div>
    </>
  );
}
