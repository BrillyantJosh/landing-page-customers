import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogIn, Save, Loader2, CheckCircle, AlertCircle, User, ShieldCheck } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";
import { createAndSignKind0, type Kind0Content } from "@/lib/nostr-sign";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

const CURRENCIES = ["EUR", "GBP", "USD"];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "sl", name: "Slovenian — Slovenščina" },
  { code: "de", name: "German — Deutsch" },
  { code: "es", name: "Spanish — Español" },
  { code: "fr", name: "French — Français" },
  { code: "it", name: "Italian — Italiano" },
  { code: "pt", name: "Portuguese — Português" },
  { code: "nl", name: "Dutch — Nederlands" },
  { code: "hr", name: "Croatian — Hrvatski" },
  { code: "sr", name: "Serbian — Srpski" },
  { code: "bs", name: "Bosnian — Bosanski" },
  { code: "pl", name: "Polish — Polski" },
  { code: "cs", name: "Czech — Čeština" },
  { code: "sk", name: "Slovak — Slovenčina" },
  { code: "ru", name: "Russian — Русский" },
  { code: "tr", name: "Turkish — Türkçe" },
  { code: "ja", name: "Japanese — 日本語" },
  { code: "zh", name: "Chinese — 中文" },
  { code: "ko", name: "Korean — 한국어" },
  { code: "ar", name: "Arabic — العربية" },
];

const COUNTRIES = [
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BD", name: "Bangladesh" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "XK", name: "Kosovo" },
  { code: "KW", name: "Kuwait" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MT", name: "Malta" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "RS", name: "Serbia" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VN", name: "Vietnam" },
  { code: "ZW", name: "Zimbabwe" },
];

interface ProfileState {
  hexId: string;
  privateKeyHex: string;
}

export default function MojProfil() {
  const location = useLocation();
  const state = location.state as ProfileState | null;

  const [profile, setProfile] = useState<Kind0Content>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Country autocomplete
  const [countryInput, setCountryInput] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const filteredCountries = countryInput.length >= 1
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countryInput.toLowerCase()) ||
        c.code.toLowerCase().includes(countryInput.toLowerCase())
      ).slice(0, 8)
    : [];

  // Language autocomplete
  const [languageInput, setLanguageInput] = useState("");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const filteredLanguages = languageInput.length >= 1
    ? LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(languageInput.toLowerCase()) ||
        l.code.toLowerCase().includes(languageInput.toLowerCase())
      ).slice(0, 8)
    : [];

  useEffect(() => {
    if (!state?.hexId) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/profile/${state.hexId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        setFetchError("Profila ni bilo mogoče naložiti.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [state?.hexId]);

  const handleSave = async () => {
    if (!state?.privateKeyHex) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const tags: string[][] = [];
      if (profile.language) tags.push(["lang", profile.language]);

      const event = createAndSignKind0(state.privateKeyHex, profile, tags);
      const res = await fetch("/api/broadcast-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveResult({ ok: true, message: "Profil uspešno shranjen!" });
      } else {
        setSaveResult({ ok: false, message: "Pošiljanje ni uspelo. Poskusi znova." });
      }
    } catch {
      setSaveResult({ ok: false, message: "Napaka pri shranjevanju." });
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof Kind0Content, value: string) =>
    setProfile((p) => ({ ...p, [field]: value }));

  if (!state?.hexId || !state?.privateKeyHex) {
    return (
      <>
        <RotatingBackground />
        <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
          <div className="glass-card p-8 max-w-sm text-center space-y-4">
            <p className="text-foreground/80">Skeniraj WIF ključ, da dostopaš do svojega profila.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-5 py-2.5 font-medium hover:bg-lana-purple/90 transition">
              <ArrowLeft className="w-4 h-4" /> Nazaj
            </Link>
          </div>
        </div>
      </>
    );
  }

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
          <div className="w-full max-w-xl space-y-6 animate-fade-in">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
            >
              <ArrowLeft className="w-4 h-4" /> Nazaj
            </button>

            <div className="glass-card p-8 sm:p-10 space-y-6 relative overflow-hidden">
              <User className="absolute top-6 right-6 w-5 h-5 text-lana-purple/50" />

              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-lana-ink">Moj profil</h1>

              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-lana-purple" />
                </div>
              ) : fetchError ? (
                <p className="text-sm text-destructive">{fetchError}</p>
              ) : (
                <div className="space-y-4">
                  <Field label="Ime" value={profile.name || ""} onChange={(v) => set("name", v)} />
                  <Field label="Prikazno ime" value={profile.display_name || ""} onChange={(v) => set("display_name", v)} />
                  <Field label="O meni" value={profile.about || ""} onChange={(v) => set("about", v)} multiline />
                  <Field label="Slika (URL)" value={profile.picture || ""} onChange={(v) => set("picture", v)} />
                  <Field label="E-pošta" value={profile.email || ""} onChange={(v) => set("email", v)} />
                  <Field label="Lokacija (mesto)" value={profile.location || ""} onChange={(v) => set("location", v)} />

                  {/* Country autocomplete */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Država</label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={
                        profile.country
                          ? `${COUNTRIES.find(c => c.code === profile.country)?.name ?? profile.country} (${profile.country})`
                          : countryInput
                      }
                      onChange={(e) => {
                        setCountryInput(e.target.value);
                        setShowCountryDropdown(true);
                        if (profile.country) set("country", "");
                      }}
                      onFocus={() => { if (!profile.country) setShowCountryDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
                      placeholder="Začni tipkati ime ali ISO kodo (npr. SI)"
                      className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lana-purple/40"
                    />
                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border/70 rounded-2xl shadow-xl max-h-52 overflow-y-auto text-sm">
                        {filteredCountries.map((c) => (
                          <li
                            key={c.code}
                            onMouseDown={() => {
                              set("country", c.code);
                              setCountryInput("");
                              setShowCountryDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-lana-lavender/40"
                          >
                            <span className="font-mono text-xs text-muted-foreground w-7 shrink-0">{c.code}</span>
                            <span>{c.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Language autocomplete */}
                  <div className="relative">
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Jezik</label>
                    <input
                      type="text"
                      autoComplete="off"
                      value={
                        profile.language
                          ? `${LANGUAGES.find(l => l.code === profile.language)?.name ?? profile.language} (${profile.language})`
                          : languageInput
                      }
                      onChange={(e) => {
                        setLanguageInput(e.target.value);
                        setShowLanguageDropdown(true);
                        if (profile.language) set("language", "");
                      }}
                      onFocus={() => { if (!profile.language) setShowLanguageDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowLanguageDropdown(false), 150)}
                      placeholder="Začni tipkati jezik ali ISO kodo (npr. sl)"
                      className="w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lana-purple/40"
                    />
                    {showLanguageDropdown && filteredLanguages.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-border/70 rounded-2xl shadow-xl max-h-52 overflow-y-auto text-sm">
                        {filteredLanguages.map((l) => (
                          <li
                            key={l.code}
                            onMouseDown={() => {
                              set("language", l.code);
                              setLanguageInput("");
                              setShowLanguageDropdown(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-lana-lavender/40"
                          >
                            <span className="font-mono text-xs text-muted-foreground w-7 shrink-0">{l.code}</span>
                            <span>{l.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground/70 mb-1.5">Valuta</label>
                    <div className="flex flex-wrap gap-2">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => set("currency", c)}
                          className={`text-xs font-semibold rounded-full px-3 py-1.5 transition ${
                            profile.currency === c
                              ? "bg-lana-purple text-white"
                              : "bg-white/70 text-foreground/70 hover:bg-white border border-border/70"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Statement of Responsibility */}
                  <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <label className="block text-sm font-semibold text-amber-900">Izjava o samoodgovornosti</label>
                    </div>
                    <p className="text-xs text-amber-800/90 leading-relaxed">
                      Napišite kratko osebno izjavo, da brezpogojno sprejemate samo-odgovornost. Kateri koli jezik je v redu.
                    </p>
                    <textarea
                      value={profile.statement_of_responsibility || ""}
                      onChange={(e) => set("statement_of_responsibility", e.target.value)}
                      rows={4}
                      placeholder="Npr.: Jaz, [Ime Priimek], brezpogojno sprejemam odgovornost za vse kar naredim ali pa bi moral narediti pa nisem."
                      className="w-full rounded-2xl border border-amber-200/70 bg-white/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none"
                    />
                  </div>

                  {saveResult && (
                    <div className={`flex items-start gap-2 rounded-2xl p-3 ${saveResult.ok ? "bg-emerald-50/70 border border-emerald-200/60" : "bg-destructive/10 border border-destructive/20"}`}>
                      {saveResult.ok
                        ? <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />}
                      <p className={`text-xs ${saveResult.ok ? "text-emerald-700" : "text-destructive"}`}>{saveResult.message}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-lana-purple text-white px-5 py-3 font-semibold hover:bg-lana-purple/90 transition disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Shranjujem…" : "Shrani profil"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Lepo. Tvoje.</p>
        </footer>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const base = "w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lana-purple/40";
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground/70 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={base + " resize-none"}
        />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
}
