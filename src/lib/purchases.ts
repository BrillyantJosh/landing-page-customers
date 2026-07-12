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
  paymentType: string | null;
  receiptUrl: string | null;
  receiptType: string | null;
  receiptDescription: string | null;
  invoiceNumber: string | null;
  exchangeRate: number | null;
}

export type PurchaseTotals = Record<string, { fiat: number; lana: number; count: number }>;

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
  return {
    purchases: data.purchases || [],
    totals: data.totals || {},
    count: data.count ?? (data.purchases || []).length,
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
