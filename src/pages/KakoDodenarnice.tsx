import { Link } from "react-router-dom";
import { ArrowLeft, Wallet, ExternalLink } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

// url set = active (offers available, tinted green); url null = "Kmalu / Soon"
const PORTALS = [
  { nameKey: "portal_pridelovalci_name", descKey: "portal_pridelovalci_desc", url: "https://lanaeco.farm" },
  { nameKey: "portal_trgovine_name",     descKey: "portal_trgovine_desc",     url: "https://lanaeco.shop" },
  { nameKey: "portal_restavracije_name", descKey: "portal_restavracije_desc", url: "https://lana.restaurant" },
  { nameKey: "portal_lepota_name",       descKey: "portal_lepota_desc",       url: "https://lanabeauty.care" },
  { nameKey: "portal_pohistvo_name",     descKey: "portal_pohistvo_desc",     url: "https://lana.furniture" },
  { nameKey: "portal_moda_name",         descKey: "portal_moda_desc",         url: null },
  { nameKey: "portal_gradnja_name",      descKey: "portal_gradnja_desc",      url: null },
  { nameKey: "portal_otroci_name",       descKey: "portal_otroci_desc",       url: null },
  { nameKey: "portal_zivali_name",       descKey: "portal_zivali_desc",       url: null },
  { nameKey: "portal_pocitnice_name",    descKey: "portal_pocitnice_desc",    url: null },
  { nameKey: "portal_trznica_name",      descKey: "portal_trznica_desc",      url: null },
  { nameKey: "portal_dogodki_name",      descKey: "portal_dogodki_desc",      url: null },
];

const body = {
  sl: {
    p1: <>Najlažji način, da pridete do registrirane Lana denarnice na kartici, je, da pri ponudniku, ki je del <strong className="text-lana-ink">Ekonomije Obilja</strong>, kupite nek izdelek ali storitev.</>,
    p2: <>Ko opravite nakup pri katerem koli od naših ponudnikov, prejmete nazaj del vrednosti v obliki povratnih sredstev — <strong className="text-lana-ink">med 5 % in 20 %</strong> — ki se samodejno naložijo na vašo Lana denarnico.</>,
    p3: "Lana denarnica je vaša osebna odgovornost. Nihče drug ne skrbi zanjo namesto vas — vi ste edini imetnik ključa. To je svoboda in odgovornost hkrati. Kartico hranite varno, ključa pa ne delite.",
    p4: "Poiščite ponudnika na enem od naših portalov:",
    soon: "Kmalu",
  },
  en: {
    p1: <>The easiest way to get a registered Lana wallet on a card is to buy a product or service from a provider who is part of the <strong className="text-lana-ink">Economy of Abundance</strong>.</>,
    p2: <>When you make a purchase with any of our providers, you receive back a portion of the value as cashback — <strong className="text-lana-ink">between 5% and 20%</strong> — automatically loaded onto your Lana wallet.</>,
    p3: "The Lana wallet is your personal responsibility. No one else manages it for you — you are the sole key holder. This is both freedom and responsibility. Keep your card safe and do not share your key.",
    p4: "Find a provider in one of our portals:",
    soon: "Soon",
  },
};

export default function KakoDodenarnice() {
  const { lang } = useLang();
  const tx = body[lang];

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
              <Wallet className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">{t("kdd_kicker", lang)}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  {t("kdd_title1", lang)} <span className="text-gradient-purple">{t("kdd_title2", lang)}</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>{tx.p1}</p>
                <p>{tx.p2}</p>
                <p>{tx.p3}</p>
                <p className="pt-2 font-semibold text-lana-ink">{tx.p4}</p>
              </div>
            </article>

            <div className="grid sm:grid-cols-2 gap-3">
              {PORTALS.map((portal) =>
                portal.url ? (
                  <a
                    key={portal.nameKey}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-5 flex items-center gap-4 bg-emerald-50/70 border-emerald-200/60 hover:bg-emerald-50/90 hover:scale-[1.01] transition-transform group"
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
                    <span className="text-[10px] text-muted-foreground shrink-0">{tx.soon}</span>
                  </div>
                )
              )}
            </div>

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
