import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Check } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function PravicaDoObilja() {
  const navigate = useNavigate();
  const { lang } = useLang();

  const principles = [
    t("pdo_pr1", lang), t("pdo_pr2", lang), t("pdo_pr3", lang), t("pdo_pr4", lang),
    t("pdo_pr5", lang), t("pdo_pr6", lang), t("pdo_pr7", lang), t("pdo_pr8", lang),
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
              <Sparkles className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">{t("pdo_kicker", lang)}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  {t("pdo_title1", lang)} <span className="text-gradient-purple">{t("pdo_title2", lang)}</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>{t("pdo_p1", lang)}</p>
                <p>{t("pdo_p2", lang)}</p>

                <div className="space-y-3 pt-2">
                  <p className="font-semibold text-lana-ink">{t("pdo_believe", lang)}</p>
                  <ul className="space-y-2.5 pl-1">
                    {principles.map((p, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-3 w-1.5 h-1.5 rounded-full bg-lana-purple shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="pt-3 italic text-center font-display text-xl text-lana-ink">
                  {t("pdo_quote1", lang)}
                  <br />
                  {t("pdo_quote2", lang)}
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
                {t("pdo_agree", lang)}
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
