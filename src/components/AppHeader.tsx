import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

export function AppHeader() {
  const { lang, setLang } = useLang();

  return (
    <header className="px-6 sm:px-10 lg:px-16 pt-6 sm:pt-8 flex items-center justify-between gap-3">
      <Link to="/" className="inline-flex items-center gap-3 hover:opacity-80 transition">
        <LanaLogo />
      </Link>

      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <div className="inline-flex items-center rounded-full bg-white/75 backdrop-blur-md border border-white/60 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLang("sl")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === "sl" ? "bg-lana-purple text-white shadow" : "text-foreground/60 hover:text-foreground"}`}
          >
            SL
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${lang === "en" ? "bg-lana-purple text-white shadow" : "text-foreground/60 hover:text-foreground"}`}
          >
            EN
          </button>
        </div>

        <a
          href={APP_LOGIN_URL}
          className="inline-flex items-center gap-2 rounded-full bg-white/75 backdrop-blur-md border border-white/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-white transition"
        >
          <LogIn className="w-4 h-4 text-lana-purple" />
          {t("login", lang)}
        </a>
      </div>
    </header>
  );
}
