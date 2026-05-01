import { Link } from "react-router-dom";
import { ArrowLeft, LogIn, Heart } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

export default function ZivljenjeJeLepo() {
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
              <Heart className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <header className="text-center space-y-3">
                <p className="text-sm font-medium text-lana-purple/80 tracking-wide uppercase">Spoznanje</p>
                <h1 className="font-display text-4xl sm:text-5xl font-semibold text-lana-ink">
                  Življenje je <span className="text-gradient-purple">lepo</span>
                </h1>
                <div className="flex items-center justify-center gap-2 opacity-60">
                  <div className="h-px w-12 bg-foreground/30" />
                  <img src="/lana-favicon.png" alt="" className="w-4 h-4" />
                  <div className="h-px w-12 bg-foreground/30" />
                </div>
              </header>

              <div className="space-y-4 text-foreground/85 leading-relaxed">
                <p>Ste kdaj v naravi opazili vzorce, ki se ponavljajo na vsakem koraku — v kapljici dežja, v listu, v dotiku, v poljubu? Narava, katere del smo, deluje čarobno. In ko si dovolimo začutiti njen ritem in razumeti njeno postavitev, lahko tudi sami ustvarjamo nove oblike, ki nosijo isto čarovnijo.</p>

                <p>Zato ne potrebujete posebne šole ali znanja. Dovolj je, da sledite svojemu zanimanju. Korak za korakom, z majhnimi premiki, se začne razkrivati bistvo.</p>

                <p>Lepota življenja je v tem, da ga ni treba popolnoma razumeti. Ni treba vedeti, kako se bodo stvari odvile, in ni ga mogoče nadzorovati. Dovolj je, da se zavedamo, da se čarovnija zgodi takrat, ko nasprotja postavimo v ravnovesje in jim dovolimo, da se sama uglasijo v celoto.</p>

                <p>Takrat nastane nekaj posebnega.</p>

                <p>Ko takšne postavitve povezujemo med seboj, se začne ustvarjati mandalni učinek — iz enega jedra se vzorci širijo v vse smeri in oblikujejo prečudovite kombinacije, ki jemljejo dih. Ostane samo še občudovanje lepote življenja.</p>

                <div className="flex justify-center my-6">
                  <img
                    src="/mandala.png"
                    alt="Mandala — vzorci življenja"
                    className="w-full max-w-sm rounded-3xl shadow-lg"
                  />
                </div>

                <div className="border-t border-foreground/10 pt-4 space-y-4">
                  <p className="font-semibold text-lana-ink">In za tiste malo bolj »ostre« poglede 😉</p>

                  <p>Morda se bo kdo zdrznil ob tem zapisu, češ, da je sanjaški. Razumljivo — tudi sam sem nekoč razmišljal podobno.</p>

                  <p>A sčasoma sem opazil, da me nenehno analiziranje in prepričanje, da moram vse razumeti, oddaljujeta od občutka miru. Ko sem si dovolil ne vedeti in zaupati, da se prave stvari razkrijejo ob pravem času, se je vse umirilo.</p>

                  <p>In prav v tem miru se skriva lepota.</p>

                  <p>To je tisto, kar imenujemo sreča. Zato smo tukaj — da jo živimo.</p>

                  <p>Če lahko naši izdelki in storitve, ustvarjeni iz teh načel, prispevajo k skupni sreči, potem je naš namen več kot izpolnjen.</p>

                  <p className="font-semibold text-lana-ink">Želimo vam lepo življenje.<br />Ker prav to iščemo vsi.</p>
                </div>
              </div>
            </article>

            <footer className="flex flex-col items-center gap-3 text-center pb-8">
              <p className="text-sm text-foreground/70 italic font-medium">Lana. Preprosto. Lepo. Tvoje.</p>
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
