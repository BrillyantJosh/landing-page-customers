import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { RotatingBackground } from "@/components/RotatingBackground";
import { AppHeader } from "@/components/AppHeader";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { fetchPurchases, type Purchase, type PurchaseTotals } from "@/lib/purchases";
import { PurchaseRow, PurchaseTotalsBar } from "@/components/PurchaseList";

const PAGE_SIZE = 20;

/**
 * Full, paginated buyer purchase history. Self-sufficient from the URL :hexId
 * (purchases are public relay data — no scan/state needed), so it survives a
 * hard reload / shared link. Reached from the check page's "See all" button.
 */
export default function Nakupi() {
  const { hexId } = useParams<{ hexId: string }>();
  const navigate = useNavigate();
  const { lang } = useLang();

  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [totals, setTotals] = useState<PurchaseTotals>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const validHex = !!hexId && hexId.length === 64 && /^[0-9a-f]+$/.test(hexId);

  useEffect(() => {
    if (!validHex) {
      setLoading(false);
      setError(lang === "en" ? "Invalid wallet id." : "Neveljaven ID denarnice.");
      return;
    }
    let alive = true;
    setLoading(true);
    fetchPurchases(hexId!)
      .then((d) => {
        if (!alive) return;
        setPurchases(d.purchases);
        setTotals(d.totals);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e.message || (lang === "en" ? "Failed to load" : "Napaka pri nalaganju"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hexId, validHex]);

  const list = purchases || [];
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = list.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const goPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <RotatingBackground />

      <div className="relative min-h-screen flex flex-col">
        <AppHeader />

        <main className="flex-1 px-6 sm:px-10 lg:px-16 py-8 lg:py-14 flex flex-col items-center">
          <div className="w-full max-w-xl space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground transition"
              >
                <ArrowLeft className="w-4 h-4" /> {t("back", lang)}
              </button>
              <h1 className="font-display text-2xl font-semibold text-lana-ink flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-lana-purple" />
                {t("ph_title", lang)}
              </h1>
            </div>

            {loading ? (
              <div className="glass-card p-10 flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-lana-purple" />
                <p className="text-sm text-muted-foreground">{t("ph_loading", lang)}</p>
              </div>
            ) : error ? (
              <div className="glass-card p-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : list.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm text-muted-foreground">{t("ph_empty", lang)}</p>
              </div>
            ) : (
              <>
                {/* Totals summary */}
                <div className="glass-card p-5 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("ph_total", lang)}</p>
                  <PurchaseTotalsBar totals={totals} />
                </div>

                {/* List */}
                <div className="space-y-2">
                  {pageItems.map((p) => (
                    <PurchaseRow key={p.txId} p={p} lang={lang} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => goPage(safePage - 1)}
                      disabled={safePage === 0}
                      className="inline-flex items-center gap-1 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" /> {t("ph_prev", lang)}
                    </button>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {safePage + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => goPage(safePage + 1)}
                      disabled={safePage >= totalPages - 1}
                      className="inline-flex items-center gap-1 rounded-2xl bg-white/80 hover:bg-white border border-border/70 px-4 py-2 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t("ph_next", lang)} <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <footer className="px-6 sm:px-10 lg:px-16 pb-6 text-center">
          <p className="text-xs text-foreground/60 italic">{t("footer", lang)}</p>
        </footer>
      </div>
    </>
  );
}
