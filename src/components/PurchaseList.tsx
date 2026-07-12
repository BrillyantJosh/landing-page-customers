import { Store, Receipt, ExternalLink } from "lucide-react";
import type { Lang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import {
  type Purchase,
  type PurchaseTotals,
  fmtFiat,
  fmtLana,
  fmtDate,
  resolveReceiptUrl,
} from "@/lib/purchases";

function payLabel(pt: string | null, lang: Lang): string {
  if (!pt) return "";
  if (pt === "cash") return lang === "en" ? "Cash" : "Gotovina";
  return pt.toUpperCase(); // LANA
}

/** Per-currency totals as small pills. */
export function PurchaseTotalsBar({ totals }: { totals: PurchaseTotals }) {
  const entries = Object.entries(totals);
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([cur, tot]) => (
        <div
          key={cur}
          className="rounded-full bg-lana-lavender/70 border border-lana-purpleSoft/40 px-3 py-1.5 text-xs"
        >
          <span className="font-semibold text-lana-ink">{fmtFiat(tot.fiat, cur)}</span>
          <span className="text-muted-foreground">
            {" · "}
            {fmtLana(tot.lana)} LANA · {tot.count}×
          </span>
        </div>
      ))}
    </div>
  );
}

/** A single purchase: merchant + date + Fiat/LANA + what-was-bought + receipt. */
export function PurchaseRow({ p, lang }: { p: Purchase; lang: Lang }) {
  const what = p.receiptDescription || p.invoiceNumber;
  const merchant =
    p.merchantName ||
    (p.merchantHex ? p.merchantHex.slice(0, 10) + "…" : lang === "en" ? "Unknown merchant" : "Neznan trgovec");
  return (
    <div className="rounded-2xl bg-white/55 border border-white/60 px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 font-medium text-sm text-lana-ink">
            <Store className="w-3.5 h-3.5 text-lana-purple shrink-0" />
            <span className="truncate">{merchant}</span>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{fmtDate(p.date)}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-sm text-lana-ink tabular-nums">{fmtFiat(p.fiatAmount, p.currency)}</div>
          <div className="text-[11px] text-muted-foreground tabular-nums">{fmtLana(p.lanaAmount)} LANA</div>
        </div>
      </div>
      {(what || p.receiptUrl || p.paymentType) && (
        <div className="mt-2 pt-2 border-t border-lana-purpleSoft/25 flex items-center gap-2 flex-wrap text-[11px]">
          {what && (
            <span className="text-muted-foreground inline-flex items-center gap-1 min-w-0">
              <Receipt className="w-3 h-3 shrink-0" />
              <span className="truncate">{what}</span>
            </span>
          )}
          {p.receiptUrl && (
            <a
              href={resolveReceiptUrl(p.receiptUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-lana-purple hover:underline shrink-0"
            >
              <ExternalLink className="w-3 h-3" /> {t("ph_receipt", lang)}
            </a>
          )}
          {p.paymentType && (
            <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-lana-lavender text-lana-ink/70 uppercase shrink-0">
              {payLabel(p.paymentType, lang)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
