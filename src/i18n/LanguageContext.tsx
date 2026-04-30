import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { TRANSLATIONS, type Language } from "./translations";

type Ctx = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (typeof TRANSLATIONS)[Language];
};

const LanguageContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "lana-landing-lang";

function detectInitial(): Language {
  if (typeof window === "undefined") return "sl";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
  if (stored && stored in TRANSLATIONS) return stored;
  const nav = window.navigator.language.toLowerCase();
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("de")) return "de";
  if (nav.startsWith("it")) return "it";
  return "sl";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectInitial());

  const setLang = (l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, l);
  };

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: TRANSLATIONS[lang] }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
