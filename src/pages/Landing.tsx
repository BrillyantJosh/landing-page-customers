import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Sparkles, Heart, Globe2, Loader2, AlertCircle, Wallet } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { InlineWifScanner } from "@/components/InlineWifScanner";
import { LanaCardMock } from "@/components/LanaCardMock";
import { convertWifToIds } from "@/lib/crypto";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export default function Landing() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWif = async (wif: string) => {
    setLoading(true);
    setError(null);
    setScanning(false);
    try {
      const ids = await convertWifToIds(wif);
      navigate(`/check/${ids.nostrHexId}`, { state: ids });
    } catch (err) {
      console.error(err);
      setError(t("scan_error", lang));
    } finally {
      setLoading(false);
    }
  };

  const heroLines = t("landing_hero", lang).split("\n");

  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        <AppHeader />

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl w-full mx-auto">
            {/* LEFT: hero copy */}
            <section className="space-y-8 animate-fade-in text-center lg:text-left">
              <h1 className="hero-glow font-display font-semibold leading-[1.05] text-5xl sm:text-6xl lg:text-7xl text-lana-ink">
                {heroLines[0]}
                <br />
                {heroLines[1]}
              </h1>

              <p className="hero-glow-soft text-lg sm:text-xl text-lana-ink/95 max-w-md font-semibold mx-auto lg:mx-0">
                {t("landing_sub", lang)}
              </p>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/pravica-do-obilja" className="glass-pill px-4 py-2.5 hover:bg-white/85 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 rounded-full bg-lana-lavender flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-lana-purple" />
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-sm font-semibold text-lana-ink">{t("pill_pravica", lang)}</p>
                    <p className="text-[11px] text-muted-foreground">{t("pill_pravica_sub", lang)}</p>
                  </div>
                </Link>
                <Link to="/zivljenje-je-lepo" className="glass-pill px-4 py-2.5 hover:bg-white/85 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 rounded-full bg-lana-lavender flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4 text-lana-purple" />
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-sm font-semibold text-lana-ink">{t("pill_zivljenje", lang)}</p>
                    <p className="text-[11px] text-muted-foreground">{t("pill_zivljenje_sub", lang)}</p>
                  </div>
                </Link>
                <Link to="/nova-realnost" className="glass-pill px-4 py-2.5 hover:bg-white/85 hover:scale-[1.02] transition-transform">
                  <div className="w-6 h-6 rounded-full bg-lana-lavender flex items-center justify-center shrink-0">
                    <Globe2 className="w-4 h-4 text-lana-purple" />
                  </div>
                  <div className="leading-tight text-left">
                    <p className="text-sm font-semibold text-lana-ink">{t("pill_nova", lang)}</p>
                    <p className="text-[11px] text-muted-foreground">{t("pill_nova_sub", lang)}</p>
                  </div>
                </Link>
              </div>
            </section>

            {/* RIGHT: scan card */}
            <section className="space-y-4 animate-fade-in">
              <div className="glass-card p-7 sm:p-8 relative">
                <div className="flex justify-center -mt-16 mb-3">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-white/80 flex items-center justify-center">
                    <img src="/lana-favicon.png" alt="Lana" className="w-12 h-12 object-contain" />
                  </div>
                </div>

                <h2 className="text-center font-display text-2xl sm:text-3xl font-semibold text-lana-ink">
                  {t("scan_title", lang)}
                </h2>
                <p className="text-center text-sm text-muted-foreground mt-2 mb-6">
                  {t("scan_sub", lang)}
                </p>

                <div className="scan-frame w-full aspect-[3/2] relative overflow-hidden p-0">
                  {scanning ? (
                    <InlineWifScanner active={scanning} onScan={processWif} onStop={() => setScanning(false)} />
                  ) : loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-lana-purple">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <span className="text-sm font-medium">{t("scan_checking", lang)}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setScanning(true)}
                      className="absolute inset-0 group rounded-3xl"
                      aria-label={t("scan_ready", lang)}
                    >
                      <LanaCardMock />
                      <span className="absolute inset-0 rounded-3xl ring-0 group-hover:ring-4 group-hover:ring-lana-purple/30 transition" />
                    </button>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-2 h-2 rounded-full ${scanning ? "bg-emerald-500" : "bg-lana-purple"} animate-pulse-soft`} />
                  <span>{scanning ? t("scan_scanning", lang) : t("scan_ready", lang)}</span>
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3">
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <p className="text-xs text-destructive">{error}</p>
                  </div>
                )}

                <div className="mt-5 text-center">
                  <Link
                    to="/kako-do-denarnice"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-lana-purple hover:text-lana-purple/75 underline underline-offset-4 transition"
                  >
                    <Wallet className="w-4 h-4" />
                    {t("scan_no_wallet", lang)}
                  </Link>
                </div>
              </div>

              <div className="glass-card p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-lana-purple" />
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  {t("about_text", lang)}
                </p>
              </div>
            </section>
          </div>

          <footer className="mt-14 lg:mt-20 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-foreground/70 italic font-medium">{t("footer", lang)}</p>
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-px w-16 bg-foreground/30" />
              <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
              <div className="h-px w-16 bg-foreground/30" />
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
