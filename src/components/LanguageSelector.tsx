import { Globe, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { LANGUAGE_LABELS, type Language } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-white/75 backdrop-blur-md border border-white/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-white/90 transition",
          open && "bg-white"
        )}
      >
        <Globe className="w-4 h-4 text-lana-purple" />
        <span>{LANGUAGE_LABELS[lang]}</span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-xl overflow-hidden">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-lana-lavender/40 transition"
            >
              <span>{LANGUAGE_LABELS[l]}</span>
              {l === lang && <Check className="w-4 h-4 text-lana-purple" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
