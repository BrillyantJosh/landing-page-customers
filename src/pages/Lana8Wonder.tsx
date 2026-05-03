import { ArrowLeft, Star, ExternalLink } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function Lana8Wonder() {
  const { lang } = useLang();

  const paragraphs = ["l8w_p1","l8w_p2","l8w_p3","l8w_p4","l8w_p5","l8w_p6"];

  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        <AppHeader />

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" /> {t("back", lang)}
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
                {paragraphs.map((key) => (
                  <p key={key}>{t(key, lang)}</p>
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
                {t("l8w_visit", lang)}
              </a>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-8 py-4 text-base font-semibold transition"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("back", lang)}
              </button>
            </div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">{t("footer", lang)}</p>
        </footer>
      </div>
    </>
  );
}
