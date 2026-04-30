import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Wallet, ExternalLink } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

const PORTALS = [
  { name: "Lana Pridelovalci", desc: "Lokalna hrana & pridelki", url: "https://lanaeco.farm" },
  { name: "Lana Trgovine", desc: "Splošne trgovine", url: "https://lanaeco.shop" },
  { name: "Lana Restavracije", desc: "Hrana & pijača", url: "https://lana.restaurant" },
  { name: "Lana Lepota & Nega", desc: "Kozmetika & wellness", url: "https://lanabeauty.care" },
  { name: "Lana Moda", desc: "Oblačila & modni dodatki", url: "https://lana.fashion" },
  { name: "Lana Pohištvo", desc: "Dom & oprema", url: "https://lana.furniture" },
  { name: "Lana Otroci", desc: "Igrače & otroški svet", url: "https://lana.kids" },
  { name: "Lana Hišni ljubljenčki", desc: "Hrana & oprema za živali", url: "https://lana.pet" },
  { name: "Lana Gradnja", desc: "Materiali & storitve", url: "https://lana.construction" },
  { name: "Lana Počitnice", desc: "Potovanja & nastanitve", url: "https://lana.vacations" },
  { name: "Lana Tržnica", desc: "Splošna tržnica", url: null },
];

export default function KakoDodenarnice() {
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
              <Wallet className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  Kako do <span className="text-gradient-purple">denarnice?</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>
                  Najlažji način, da pridete do registrirane Lana denarnice na kartici, je, da pri nekom, ki je del{" "}
                  <strong className="text-lana-ink">Ekonomije Obilja</strong>, kupite nek izdelek ali storitev.
                </p>
                <p>
                  Ko opravite nakup pri katerem koli od naših partnerjev, prejmete nazaj del vrednosti v obliki
                  povratnih sredstev — <strong className="text-lana-ink">med 5 % in 20 %</strong> — ki se samodejno
                  naložijo na vašo Lana denarnico.
                </p>
                <p>
                  Lana denarnica je vaša osebna odgovornost. Nihče drug ne skrbi zanjo namesto vas — vi ste
                  edini imetnik ključa. To je svoboda in odgovornost hkrati. Kartico hranite varno, ključa pa ne delite.
                </p>

                <p className="pt-2 font-semibold text-lana-ink">Poiščite ponudnika na enem od naših portalov:</p>
              </div>
            </article>

            {/* Portal grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {PORTALS.map((portal) =>
                portal.url ? (
                  <a
                    key={portal.name}
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-5 flex items-center gap-4 hover:bg-white/85 hover:scale-[1.01] transition-transform group"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-lana-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lana-ink text-sm leading-tight">{portal.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{portal.desc}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-lana-purple/50 group-hover:text-lana-purple transition shrink-0" />
                  </a>
                ) : (
                  <div
                    key={portal.name}
                    className="glass-card p-5 flex items-center gap-4 opacity-50 cursor-default"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5 text-lana-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lana-ink text-sm leading-tight">{portal.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{portal.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">Kmalu</span>
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
                Nazaj na začetek
              </Link>
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
