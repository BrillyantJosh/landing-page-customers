import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LogIn, Save, Loader2, CheckCircle, AlertCircle, User } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";
import { createAndSignKind0, type Kind0Content } from "@/lib/nostr-sign";

const APP_LOGIN_URL = "https://app.mejmosefajn.org";
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "HRK"];

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
                  <Field label="Lokacija" value={profile.location || ""} onChange={(v) => set("location", v)} />

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
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Več. Tvoje.</p>
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
