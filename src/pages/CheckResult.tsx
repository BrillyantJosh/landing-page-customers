import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, Snowflake, Sparkles, Wallet } from "lucide-react";
import { LanaLogo } from "@/components/LanaLogo";
import { LanguageSelector } from "@/components/LanguageSelector";
import { RotatingBackground } from "@/components/RotatingBackground";
import { useLanguage } from "@/i18n/LanguageContext";
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

const CURRENCIES = ["EUR", "USD", "GBP"];

export default function CheckResult() {
  const { hexId } = useParams<{ hexId: string }>();
  const location = useLocation();
  const state = location.state as LanaIds | null;
  const { t } = useLanguage();

  const [currency, setCurrency] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("lana-landing-currency") || "EUR";
    }
    return "EUR";
  });

  const [registration, setRegistration] = useState<RegistrationResult | null>(null);
  const [regLoading, setRegLoading] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);

  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [balLoading, setBalLoading] = useState(false);

  const [accountFrozen, setAccountFrozen] = useState<boolean | null>(null);

  useEffect(() => {
    if (!state) return;

    const checkRegistration = async () => {
      try {
        const res = await fetch("/api/check-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet_id: state.walletId }),
        });
        const data = (await res.json()) as RegistrationResult;
        setRegistration(data);
        if (data.registered) {
          fetchBalance(currency);
          fetchAccountStatus();
        }
      } catch (err) {
        setRegError(err instanceof Error ? err.message : "Network error");
      } finally {
        setRegLoading(false);
      }
    };

    checkRegistration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.walletId]);

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

  const handleCurrencyChange = (cur: string) => {
    setCurrency(cur);
    if (typeof window !== "undefined") window.localStorage.setItem("lana-landing-currency", cur);
    if (registration?.registered) fetchBalance(cur);
  };

  // Missing state: redirect home
  if (!state) {
    return (
      <>
        <RotatingBackground />
        <div className="relative min-h-screen flex flex-col items-center justify-center p-8">
          <div className="glass-card p-8 max-w-sm text-center space-y-4">
            <p className="text-foreground/80">No wallet data. Please scan again.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-5 py-2.5 font-medium hover:bg-lana-purple/90 transition">
              <ArrowLeft className="w-4 h-4" /> {t.back}
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
          <LanguageSelector />
        </header>

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col items-center">
          <div className="w-full max-w-xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition">
                <ArrowLeft className="w-4 h-4" /> {t.back}
              </Link>
              <h1 className="font-display text-2xl font-semibold text-lana-ink">{t.result_title}</h1>
            </div>

            {regLoading ? (
              <div className="glass-card p-10 flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-lana-purple" />
                <p className="text-sm text-muted-foreground">{t.loading}</p>
              </div>
            ) : regError ? (
              <div className="glass-card p-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{regError}</p>
              </div>
            ) : registration?.registered ? (
              <>
                {/* Account status banner */}
                {accountFrozen === true ? (
                  <div className="glass-card p-5 flex items-start gap-3 bg-blue-50/70 border-blue-200/60">
                    <Snowflake className="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{t.result_frozen_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.result_frozen_desc}</p>
                    </div>
                  </div>
                ) : accountFrozen === false ? (
                  <div className="glass-card p-5 flex items-start gap-3 bg-emerald-50/70 border-emerald-200/60">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{t.result_active_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.result_active_desc}</p>
                    </div>
                  </div>
                ) : null}

                {/* Balance display — primary FIAT focus */}
                <div className="glass-card p-8 sm:p-10 text-center space-y-4 relative overflow-hidden">
                  <Sparkles className="absolute top-4 right-4 w-5 h-5 text-lana-purple/50" />

                  <div className="flex items-center justify-center gap-2">
                    <Wallet className="w-5 h-5 text-lana-purple" />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">{t.result_fiat_label}</span>
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
                          {t.result_unconfirmed_label}: {balance.unconfirmed.toLocaleString()} LANA
                        </p>
                      )}

                      <div className="pt-4 flex items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground mr-1">{t.currency_label}:</span>
                        {CURRENCIES.map((c) => (
                          <button
                            key={c}
                            onClick={() => handleCurrencyChange(c)}
                            className={`text-xs font-semibold rounded-full px-3 py-1.5 transition ${
                              currency === c
                                ? "bg-lana-purple text-white"
                                : "bg-white/70 text-foreground/70 hover:bg-white border border-border/70"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4">—</p>
                  )}
                </div>

                {/* Rescan */}
                <div className="flex justify-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-5 py-2.5 text-sm font-medium transition"
                  >
                    <ArrowLeft className="w-4 h-4" /> {t.rescan}
                  </Link>
                </div>
              </>
            ) : (
              // Not registered
              <div className="glass-card p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-amber-600" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-lana-ink">{t.result_unregistered_title}</h2>
                <p className="text-sm text-muted-foreground">{t.result_unregistered_desc}</p>
                <div className="pt-2">
                  <Link to="/" className="inline-flex items-center gap-2 rounded-2xl bg-lana-purple text-white px-5 py-2.5 font-medium hover:bg-lana-purple/90 transition">
                    <ArrowLeft className="w-4 h-4" /> {t.rescan}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">{t.footer_tagline}</p>
        </footer>
      </div>
    </>
  );
}
