import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Globe2 } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

const PARAGRAPHS = [
  "Trenutna realnost je takšna, kot je. Ne obsojamo je in je ne popravljamo, saj je zgolj odsev našega trenutnega zavedanja.",
  "Če želimo ustvariti novo realnost, se moramo najprej preoblikovati sami — vsak pri sebi. Šele nato lahko kot zgled začnemo preoblikovati tudi svet okoli sebe.",
  "Če v sebi čutite vzgib po spremembi realnosti — kar se danes pogosto izraža skozi politični prostor — potem ste za nas dragoceni. A prvi korak je iskrenost do samega sebe. Star način razmišljanja nas drži v prepričanju, da se spremembe lahko zgodijo le, če »pravi« ljudje pridejo na oblast.",
  "Začnimo pri osnovi: če verjamete, da je s trenutno politiko vse narobe in da ste vi edini, ki lahko to spremenite, potem postanete le nov del istega problema. To je treba preseči.",
  "Skozi brezpogojno samoodgovornost začnemo postopoma preoblikovati sebe. Pri tem se ego razgradi, mi pa prehajamo v višje, bolj vključujoče perspektive. Šele takrat začne naša perspektiva dobivati resnično vrednost — ker izhaja iz preoblikovanega zavedanja. Takšna perspektiva lahko osvetli tisto, kar je ostalim skrito, in prispeva k resnični spremembi sveta. Vse drugo je le ponavljanje iste zgodbe.",
  "To so procesi, ki zahtevajo čas. Ne temeljijo na obljubah ali hitrih rešitvah, temveč na razumevanju, kako graditi stabilne in uravnotežene sisteme. Če čutite, da imate v sebi potencial za takšno preoblikovanje, vas pri tem lahko podpremo.",
  "Začnete lahko v svojem lokalnem okolju — z uvajanjem semena obilja, brezpogojne samoodgovornosti in uravnoteženja različnih perspektiv. Najtežje je ustvariti okolje, kjer so vsi vključeni in podprti — in to zmore le nekdo, ki gradi zavedanje.",
  "Začnite z majhnimi koraki. Ko boste znali ohranjati harmonijo v manjših skupinah, boste lahko postopoma prehajali v večje sisteme, kjer bo vašemu zgledu sledilo vedno več ljudi. A zapomnite si: niste tukaj, da vodite druge, temveč da jih navdihnete. Ljudem vračate moč tako, da jih spodbudite, da sami preoblikujejo sebe — ne tako, da rešujete njihove probleme namesto njih.",
  "Oblast ne pomeni podajanja rešitev na stare probleme. To je le ponavljanje nasprotij — ena stran trdi eno, druga drugo. Resnična moč je v tem, da razumete, kako nasprotja delujejo skupaj, in znate obe perspektivi povezati v nekaj več.",
  "Kot pri kolesu: levo in desno kolo morata delovati usklajeno. Če se nagnete le na eno stran, vožnja ne traja dolgo. Ravnovesje je ključno.",
  "Zato vsak, ki čuti klic po »politični« poti, naj začne z gradnjo zavedanja — najprej pri sebi, nato v svojem okolju. Le tako lahko postane del resničnega preoblikovanja naše realnosti v nekaj več.",
];

export default function NovaRealnost() {
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
              <Globe2 className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">Za tiste, ki želite nekaj več</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  Nova <span className="text-gradient-purple">realnost</span>
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
