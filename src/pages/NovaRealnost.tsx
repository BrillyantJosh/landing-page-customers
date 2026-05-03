import { Link } from "react-router-dom";
import { ArrowLeft, Globe2 } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function NovaRealnost() {
  const { lang } = useLang();

  const paragraphs = [
    "nr_p1","nr_p2","nr_p3","nr_p4","nr_p5","nr_p6",
    "nr_p7","nr_p8","nr_p9","nr_p10","nr_p11","nr_p12","nr_p13",
  ];

  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        <AppHeader />

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition">
              <ArrowLeft className="w-4 h-4" /> {t("back", lang)}
            </Link>

            <article className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <Globe2 className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">{t("nr_kicker", lang)}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  {t("nr_title1", lang)} <span className="text-gradient-purple">{t("nr_title2", lang)}</span>
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

            <div className="flex justify-center pb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-8 py-4 text-base font-semibold shadow-lg hover:bg-lana-purple/90 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                {t("backToStart", lang)}
              </Link>
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
