import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Snowflake, Sparkles,
  Wallet, LogIn, User, ShoppingBag, Star,
} from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { RotatingBackground } from "@/components/RotatingBackground";
import type { LanaIds } from "@/lib/crypto";

interface BalanceData {
  address: string;
  confirmed: number;
  unconfirmed: number;
  lana: number;
  fiatValue: number;
  rate: number;
  currency: string;
  status: string;
}

interface RegistrationResult {
  registered: boolean;
  frozen?: boolean;
  wallet_type?: string;
}

interface Kind0Profile {
  name?: string;
  display_name?: string;
  picture?: string;
  currency?: string;
}

const APP_LOGIN_URL = "https://app.mejmosefajn.org";

export default function CheckResult() {
  const { hexId } = useParams<{ hexId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LanaIds | null;

  const [profile, setProfile] = useState<Kind0Profile | null>(null);

  const [currency, setCurrency] = useState<string>("EUR");

  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  const [accountFrozen, setAccountFrozen] = useState<boolean | null>(null);

  // Sequential init: profile first (to get currency), then registration + balance
  useEffect(() => {
    if (!state || !hexId) return;

    const init = async () => {
      // 1. Fetch KIND 0 profile — KIND 0 currency always wins on initial load
      let activeCurrency = "EUR";
      try {
        const profileRes = await fetch(`/api/profile/${hexId}`);
        if (profileRes.ok) {
          const profileData: Kind0Profile = await profileRes.json();
          setProfile(profileData);
          if (profileData.currency) {
            activeCurrency = profileData.currency;
            setCurrency(profileData.currency);
          }
        }
      } catch {}

      // 2. Check wallet registration
      try {
        const res = await fetch("/api/check-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_id: state.walletId }),
        });
        const data = (await res.json()) as RegistrationResult;
        setRegistration(data);
        if (data.registered) {
          fetchBalance(activeCurrency); // correct currency guaranteed
          fetchAccountStatus();
        }
      } catch (err) {
        setRegError(err instanceof Error ? err.message : "Napaka pri povezavi");
      } finally {
        setRegLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.walletId, hexId]);

  const fetchBalance = async (cur: string) => {
    if (!state) return;
    setBalLoading(true);
    try {
      const res = await fetch(`/api/balance/${state.walletId}?currency=${cur}`);
      if (res.ok) {
        const data = (await res.json()) as BalanceData;
        setBalance(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBalLoading(false);
    }
  };

  const fetchAccountStatus = async () => {
    if (!hexId) return;
    try {
      const res = await fetch(`/api/wallets/${hexId}`);
      if (res.ok) {
        const data = await res.json();
        setAccountFrozen(data.accountStatus === "frozen");
      }
    } catch (err) {
      console.error(err);
    }
  };

const profileName = profile?.display_name || profile?.name;

  if (!state) {
    return (
      <>
        <RotatingBackground />
        <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
          <div className="glass-card p-8 max-w-sm text-center space-y-4">
            <p className="text-foreground/80">Manjkajo podatki o denarnici. Skeniraj znova.</p>
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
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" /> Nazaj
              </Link>
              <h1 className="font-display text-2xl font-semibold text-lana-ink">Stanje računa</h1>
            </div>

            {/* Profile owner */}
            {profileName && (
              <div className="glass-card px-5 py-3 flex items-center gap-3">
                {profile?.picture ? (
                  <img src={profile.picture} alt="" className="w-9 h-9 rounded-full object-cover border border-white/60" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-lana-lavender flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-lana-purple" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground leading-none mb-0.5">Imetnik računa</p>
                  <p className="font-semibold text-lana-ink text-sm">{profileName}</p>
                </div>
              </div>
            )}

            {regLoading ? (
              <div className="glass-card p-10 flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-lana-purple" />
                <p className="text-sm text-muted-foreground">Preverjam stanje…</p>
              </div>
            ) : regError ? (
              <div className="glass-card p-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{regError}</p>
              </div>
            ) : registration?.registered ? (
              <>
                {accountFrozen === true ? (
                  <div className="glass-card p-5 flex items-start gap-3 bg-blue-50/70 border-blue-200/60">
                    <Snowflake className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Račun zamrznjen</p>
                      <p className="text-xs text-muted-foreground mt-1">Račun je trenutno zamrznjen. Sredstva so vidna, vendar omejena za prenos.</p>
                    </div>
                  </div>
                ) : accountFrozen === false ? (
                  <div className="glass-card p-5 flex items-start gap-3 bg-emerald-50/70 border-emerald-200/60">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Aktiven račun</p>
                      <p className="text-xs text-muted-foreground mt-1">Tvoja sredstva so na voljo.</p>
                    </div>
                  </div>
                ) : null}

                <div className="glass-card p-8 sm:p-10 text-center space-y-4 relative overflow-hidden">
                  <Sparkles className="absolute top-4 right-4 w-5 h-5 text-lana-purple/50" />

                  <div className="flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5 text-lana-purple" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Vrednost</span>
                  </div>

                  {balLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-lana-purple" />
                    </div>
                  ) : balance ? (
                    <>
                      <div className="font-display text-6xl sm:text-7xl font-semibold text-lana-ink">
                        {balance.fiatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-3xl sm:text-4xl text-lana-purple ml-2 font-medium">{balance.currency}</span>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {balance.lana.toLocaleString()} LANA
                        <span className="mx-2">•</span>
                        1 LANA = {balance.rate} {balance.currency}
                      </div>

                      {balance.unconfirmed > 0 && (
                        <p className="text-xs text-amber-600">
                          Nepotrjeno: {balance.unconfirmed.toLocaleString()} LANA
                        </p>
                      )}

                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">—</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <ActionButton
                    icon={<User className="w-5 h-5 text-lana-purple" />}
                    label="Moj profil"
                    desc="Uredi svoje podatke"
                    onClick={() =>
                      navigate("/moj-profil", {
                        state: { hexId, privateKeyHex: state.privateKeyHex },
                      })
                    }
                  />
                  <ActionButton
                    icon={<ShoppingBag className="w-5 h-5 text-lana-purple" />}
                    label="Kje potrošim?"
                    desc="Ponudniki v omrežju"
                    onClick={() => navigate("/kje-potrosim")}
                  />
                  <ActionButton
                    icon={<Star className="w-5 h-5 text-lana-purple" />}
                    label="Lana8Wonder"
                    desc="Vstopnica za Obilje"
                    onClick={() => navigate("/lana8wonder")}
                  />
                </div>

                <div className="flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-5 py-2.5 text-sm font-medium transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> Skeniraj znova
                  </Link>
                </div>
              </>
            ) : (
              <div className="glass-card p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-amber-600" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-lana-ink">Račun ni registriran</h2>
                <p className="text-sm text-muted-foreground">Ta WIF ključ še ni v Lana sistemu.</p>
                <div className="pt-2">
                  <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-5 py-2.5 font-medium hover:bg-lana-purple/90 transition">
                    <ArrowLeft className="w-4 h-4" /> Skeniraj znova
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">Lana. Preprosto. Lepo. Tvoje.</p>
        </footer>
      </div>
    </>
  );
}

function ActionButton({
  icon, label, desc, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-card p-4 flex flex-col items-center gap-2 text-center hover:bg-white/85 hover:scale-[1.02] transition-transform"
    >
      <div className="w-10 h-10 rounded-2xl bg-lana-lavender flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs font-semibold text-lana-ink leading-tight">{label}</p>
      <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
    </button>
  );
}
