/**
 * Buyer purchase history — shared types, fetch and formatters.
 *
 * Data comes from KIND 30933 (Purchase Transaction, customer side) read purely
 * from Nostr relays by lana-pays-check's GET /api/purchases/:hexId, which this
 * app proxies (server/index.ts). No brain connection — portable to any app that
 * proxies that endpoint.
 */

export interface Purchase {
  txId: string;
  date: number; // unix seconds
  merchantName: string | null;
  merchantHex: string | null;
  unitId: string | null;
  fiatAmount: number;
  currency: string;
  lanaAmount: number;
  paymentType: string | null;   // 'cash' (paid in EUR) | 'lana'
  cashbackFiat: number;         // buyer's fee/cashback received (cash purchases only)
  cashbackLana: number;
  lanaDiscountPer: number;      // cashback rate % (cash)
  receiptUrl: string | null;
  receiptType: string | null;
  receiptDescription: string | null;
  invoiceNumber: string | null;
  exchangeRate: number | null;
}

interface Method { fiat: number; lana: number; count: number }
export interface CurrencyTotal {
  fiat: number; lana: number; count: number;
  byCash: Method;                        // paid with cash (EUR)
  byLana: Method;                        // paid with LANA
  cashback: { fiat: number; lana: number }; // total fee received (cash purchases)
}
export type PurchaseTotals = Record<string, CurrencyTotal>;

const emptyMethod = (): Method => ({ fiat: 0, lana: 0, count: 0 });
// Old cached responses may lack the split fields — fill defaults so the UI never crashes.
function normalizeTotals(raw: any): PurchaseTotals {
  const out: PurchaseTotals = {};
  for (const [cur, t] of Object.entries(raw || {})) {
    const tt = t as any;
    out[cur] = {
      fiat: tt.fiat || 0, lana: tt.lana || 0, count: tt.count || 0,
      byCash: tt.byCash || emptyMethod(),
      byLana: tt.byLana || emptyMethod(),
      cashback: tt.cashback || { fiat: 0, lana: 0 },
    };
  }
  return out;
}

export interface PurchasesResponse {
  purchases: Purchase[];
  totals: PurchaseTotals;
  count: number;
  exchangeRates?: Record<string, number>;
  authorValidated?: boolean;
  updated_at?: string;
  error?: string;
}

/** Fetch a buyer's purchases from the (proxied) relay-backed endpoint. */
export async function fetchPurchases(hexId: string): Promise<PurchasesResponse> {
  const res = await fetch(`/api/purchases/${hexId}`);
  const data = (await res.json()) as PurchasesResponse;
  if (data.error) throw new Error(data.error);
  const purchases = (data.purchases || []).map((p) => ({
    ...p,
    cashbackFiat: p.cashbackFiat || 0,
    cashbackLana: p.cashbackLana || 0,
    lanaDiscountPer: p.lanaDiscountPer || 0,
  }));
  return {
    purchases,
    totals: normalizeTotals(data.totals),
    count: data.count ?? purchases.length,
    exchangeRates: data.exchangeRates,
    authorValidated: data.authorValidated,
    updated_at: data.updated_at,
  };
}

const SYM: Record<string, string> = { EUR: "€", USD: "$", GBP: "£", CHF: "CHF " };

export const fmtFiat = (n: number, cur: string) =>
  (SYM[cur] || cur + " ") +
  (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtLana = (n: number) =>
  (n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });

export const fmtDate = (unix: number) => {
  const d = new Date(unix * 1000);
  return (
    d.toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("sl-SI", { hour: "2-digit", minute: "2-digit" })
  );
};

/** Receipt uploads live on shop.lanapays.us; relative paths resolve there. */
export const resolveReceiptUrl = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://shop.lanapays.us${url.startsWith("/") ? "" : "/"}${url}`;
