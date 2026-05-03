import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function ZivljenjeJeLepo() {
  const { lang } = useLang();

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
              <Heart className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">{t("zjl_kicker", lang)}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  {t("zjl_title1", lang)} <span className="text-gradient-purple">{t("zjl_title2", lang)}</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>{t("zjl_p1", lang)}</p>
                <p>{t("zjl_p2", lang)}</p>
                <p>{t("zjl_p3", lang)}</p>
                <p>{t("zjl_p4", lang)}</p>
                <p>{t("zjl_p5", lang)}</p>

                <div className="flex justify-center my-6">
                  <img src="/mandala.png" alt="Mandala" className="w-full max-w-sm rounded-3xl shadow-lg" />
                </div>

                <div className="border-t border-foreground/10 pt-4 space-y-4">
                  <p className="font-semibold text-lana-ink">{t("zjl_sharp", lang)}</p>
                  <p>{t("zjl_p6", lang)}</p>
                  <p>{t("zjl_p7", lang)}</p>
                  <p>{t("zjl_p8", lang)}</p>
                  <p>{t("zjl_p9", lang)}</p>
                  <p>{t("zjl_p10", lang)}</p>
                  <p className="font-semibold text-lana-ink">
                    {t("zjl_closing1", lang)}<br />{t("zjl_closing2", lang)}
                  </p>
                </div>
              </div>
            </article>

            <footer className="flex flex-col items-center gap-3 text-center pb-8">
              <p className="text-sm text-foreground/70 italic font-medium">{t("footer", lang)}</p>
              <div className="flex items-center gap-2 opacity-50">
                <div className="h-px w-16 bg-foreground/30" />
                <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                <div className="h-px w-16 bg-foreground/30" />
              </div>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}
