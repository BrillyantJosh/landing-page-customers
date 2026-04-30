import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ScanLine, ShieldCheck, Zap, Eye, Loader2, AlertCircle } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RotatingBackground } from "@/components/RotatingBackground";
import { QRScanner } from "@/components/QRScanner";
import { useLanguage } from "@/i18n/LanguageContext";
import { convertWifToIds } from "@/lib/crypto";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [manualWif, setManualWif] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processWif = async (wif: string) => {
    setLoading(true);
    setError(null);
    try {
      const ids = await convertWifToIds(wif);
      navigate(`/check/${ids.nostrHexId}`, { state: ids });
    } catch (err) {
      console.error(err);
      setError(t.error_invalid);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualWif.trim()) processWif(manualWif.trim());
  };

  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 flex items-center justify-between">
          <LanaLogo />
          <LanguageSelector />
        </header>

        {/* Main */}
        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl w-full mx-auto">
            {/* LEFT: hero copy */}
            <section className="space-y-8 animate-fade-in">
              <h1 className="font-display font-semibold leading-[1.05] text-5xl sm:text-6xl lg:text-7xl text-lana-ink whitespace-pre-line">
                {t.hero_title_pre}
                <span className="text-gradient-purple">{t.hero_title_highlight}</span>
                {t.hero_title_post}
              </h1>

              <p className="text-lg sm:text-xl text-foreground/85 max-w-md whitespace-pre-line font-medium">
                {t.hero_subtitle}
              </p>

              <div className="flex flex-wrap gap-3">
                <FeaturePill icon={<ShieldCheck className="w-4 h-4 text-lana-purple" />} title={t.feature_safe_title} desc={t.feature_safe_desc} />
                <FeaturePill icon={<Zap className="w-4 h-4 text-lana-purple" />} title={t.feature_fast_title} desc={t.feature_fast_desc} />
                <FeaturePill icon={<Eye className="w-4 h-4 text-lana-purple" />} title={t.feature_simple_title} desc={t.feature_simple_desc} />
              </div>
            </section>

            {/* RIGHT: scan card */}
            <section className="space-y-4 animate-fade-in">
              <div className="glass-card p-7 sm:p-8 relative">
                {/* Floating logo */}
                <div className="flex justify-center -mt-16 mb-3">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-white/80 flex items-center justify-center">
                    <img src="/lana-favicon.png" alt="Lana" className="w-12 h-12 object-contain" />
                  </div>
                </div>

                <h2 className="text-center font-display text-2xl sm:text-3xl font-semibold text-lana-ink">
                  {t.scan_card_title}
                </h2>
                <p className="text-center text-sm text-muted-foreground mt-2 mb-6">
                  {t.scan_card_subtitle}
                </p>

                {/* Scan frame */}
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  disabled={loading}
                  className="scan-frame w-full aspect-[5/3] hover:bg-lana-lavender/30 transition group disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex flex-col items-center gap-2 text-lana-purple">
                      <Loader2 className="w-10 h-10 animate-spin" />
                      <span className="text-sm font-medium">{t.loading}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="w-32 sm:w-40 h-20 sm:h-24 rounded-2xl bg-gradient-to-br from-lana-purpleSoft via-lana-purple to-lana-ink shadow-lg flex items-center justify-center text-white relative overflow-hidden">
                        <img src="/lana-favicon.png" alt="" className="w-7 h-7 absolute left-3 top-3 invert opacity-90" />
                        <span className="font-display text-2xl sm:text-3xl tracking-wide">Lana</span>
                        <span className="absolute right-2 top-2 text-[8px] opacity-70">((•))</span>
                      </div>
                      <ScanLine className="w-5 h-5 text-lana-purple group-hover:scale-110 transition" />
                    </div>
                  )}
                </button>

                {/* Status */}
                <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-lana-purple animate-pulse-soft" />
                  <span>{t.scan_ready}</span>
                </div>

                {/* Manual paste */}
                <form onSubmit={handleManualSubmit} className="mt-5 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={manualWif}
                      onChange={(e) => setManualWif(e.target.value)}
                      placeholder={t.paste_placeholder}
                      disabled={loading}
                      className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 pr-28 text-sm focus:outline-none focus:ring-2 focus:ring-lana-purple/40"
                    />
                    <button
                      type="submit"
                      disabled={loading || !manualWif.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-xl bg-lana-purple text-white text-xs font-semibold px-3 py-2 hover:bg-lana-purple/90 transition disabled:opacity-50"
                    >
                      {t.scan_or_paste}
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive">{error}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Privacy note */}
              <div className="glass-card p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-lana-purple" />
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                  {t.privacy_note}
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-14 lg:mt-20 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-foreground/70 italic font-medium">{t.footer_tagline}</p>
            <div className="flex items-center gap-2 opacity-50">
              <div className="h-px w-16 bg-foreground/30" />
              <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
              <div className="h-px w-16 bg-foreground/30" />
            </div>
          </footer>
        </main>
      </div>

      <QRScanner
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={processWif}
        title={t.scan_card_title}
        description={t.scan_card_subtitle}
      />
    </>
  );
}

function FeaturePill({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass-pill px-4 py-2.5">
      <div className="w-6 h-6 rounded-full bg-lana-lavender flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="leading-tight text-left">
        <p className="text-sm font-semibold text-lana-ink">{title}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
