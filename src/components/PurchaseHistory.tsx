import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import type { Lang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { fetchPurchases, type Purchase, type PurchaseTotals } from "@/lib/purchases";
import { PurchaseRow, PurchaseTotalsBar } from "./PurchaseList";

const PREVIEW = 10;

/**
 * Last-10 purchase preview for the wallet-check page. Appears once loaded and
 * only if there is at least one purchase (keeps the balance page clean for
 * non-buyers). "See all" opens the full paginated page at /nakupi/:hexId.
 */
export function PurchaseHistory({ hexId, lang }: { hexId: string; lang: Lang }) {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[] | null>(null);
  const [totals, setTotals] = useState<PurchaseTotals>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hexId) return;
    let alive = true;
    setLoading(true);
    setFailed(false);
    fetchPurchases(hexId)
      .then((d) => {
        if (!alive) return;
        setPurchases(d.purchases);
        setTotals(d.totals);
      })
      .catch((e) => {
        console.error("[purchases] load failed:", e);
        if (alive) setFailed(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [hexId]);

  const list = purchases || [];
  // Stay hidden while loading, on error, or when there is nothing to show.
  if (loading || failed || list.length === 0) return null;

  const shown = list.slice(0, PREVIEW);

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-lana-purple" />
        <h2 className="font-display text-xl font-semibold text-lana-ink">{t("ph_title", lang)}</h2>
        <span className="ml-auto text-sm text-muted-foreground">{list.length}</span>
      </div>

      <PurchaseTotalsBar totals={totals} />

      <div className="space-y-2">
        {shown.map((p) => (
          <PurchaseRow key={p.txId} p={p} lang={lang} />
        ))}
      </div>

      {list.length > PREVIEW && (
        <button
          type="button"
          onClick={() => navigate(`/nakupi/${hexId}`)}
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-lana-purple text-white px-4 py-2.5 text-sm font-semibold hover:bg-lana-purple/90 transition"
        >
          {t("ph_see_all", lang)} ({list.length})
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
