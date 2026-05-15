import { Wallet, ExternalLink, ArrowLeft } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const PORTALS = [
  { nameKey: "portal_pridelovalci_name", descKey: "portal_pridelovalci_desc", url: "https://lanaeco.farm" },
  { nameKey: "portal_trgovine_name",     descKey: "portal_trgovine_desc",     url: "https://lanaeco.shop" },
  { nameKey: "portal_restavracije_name", descKey: "portal_restavracije_desc", url: "https://lana.restaurant" },
  { nameKey: "portal_lepota_name",       descKey: "portal_lepota_desc",       url: "https://lanabeauty.care" },
  { nameKey: "portal_moda_name",         descKey: "portal_moda_desc",         url: "https://lana.fashion" },
  { nameKey: "portal_pohistvo_name",     descKey: "portal_pohistvo_desc",     url: "https://lana.furniture" },
  { nameKey: "portal_gradnja_name",      descKey: "portal_gradnja_desc",      url: "https://lana.construction" },
  { nameKey: "portal_otroci_name",       descKey: "portal_otroci_desc",       url: "https://lana.kids" },
  { nameKey: "portal_zivali_name",       descKey: "portal_zivali_desc",       url: "https://lana.pet" },
  { nameKey: "portal_pocitnice_name",    descKey: "portal_pocitnice_desc",    url: "https://lana.vacations" },
  { nameKey: "portal_trznica_name",      descKey: "portal_trznica_desc",      url: "https://lanamarket.place" },
  { nameKey: "portal_dogodki_name",      descKey: "portal_dogodki_desc",      url: "https://lana.events" },
];

export default function KjePotrosim() {
  const { lang } = useLang();

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

            <div className="glass-card px-6 py-4">
              <h1 className="font-display text-2xl font-semibold text-lana-ink">{t("kp_title", lang)}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t("kp_sub", lang)}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {PORTALS.map((portal) =>
                portal.url ? (
                  <a
                    key={portal.nameKey}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-5 flex items-center gap-4 hover:bg-white/85 hover:scale-[1.01] transition-transform group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-lana-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lana-ink text-sm leading-tight">{t(portal.nameKey, lang)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t(portal.descKey, lang)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-lana-purple/50 group-hover:text-lana-purple transition shrink-0" />
                  </a>
                ) : (
                  <div key={portal.nameKey} className="glass-card p-5 flex items-center gap-4 opacity-50 cursor-default">
                    <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-lana-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lana-ink text-sm leading-tight">{t(portal.nameKey, lang)}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t(portal.descKey, lang)}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{lang === "en" ? "Soon" : "Kmalu"}</span>
                  </div>
                )
              )}
            </div>

            <div className="flex justify-center pb-4">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-6 py-3 text-sm font-medium transition"
              >
                <ArrowLeft className="w-4 h-4" /> {t("back", lang)}
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
