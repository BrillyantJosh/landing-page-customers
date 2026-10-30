/**
 * Reads the provider directory (providerDirectory.ts) from the relays and asks the
 * portals which of those providers each of them lists, so a search hit can open the
 * provider's page on its portal.
 *
 * Traps this avoids (see the LanaDev notes):
 *  - a relay answers at most 500 events per REQ, whatever `limit` says: every kind is
 *    paged with `until` = oldest created_at seen (inclusive, same-second events come
 *    again and are de-duplicated by id) until a page brings nothing new;
 *  - a REQ that mixes kinds shares those 500: KIND 5 alone is ~24,500 events, so
 *    `{kinds:[30901,5]}` returns ~40 units. Each kind is asked for on its own;
 *  - a relay that times out, sends CLOSED or drops the socket is not "complete", and
 *    a quiet relay (0 events) is not an empty register;
 *  - relays come from the signed KIND 38888, the four below only bootstrap that read.
 */
import WebSocket from "ws";
import {
  PROCESSOR_HEX,
  buildDirectory,
  isValidEvent,
  tagValue,
  unitKey,
  verifiedKey,
  type DirectoryBreakdown,
  type DirectoryProvider,
  type NostrEvent,
  type PortalRef,
} from "./providerDirectory.js";

export const BOOTSTRAP_RELAYS = [
  "wss://relay.lanavault.space",
  "wss://relay.lana-eternity.com",
  "wss://relay.lanaheartvoice.com",
  "wss://relay.lovelana.org",
];
const KIND_38888_AUTHOR = "9eb71bf1e9c3189c78800e4c3831c1c1a93ab43b61118818c32e4490891a35b3";

const PAGE_TIMEOUT_MS = 8000;
const MAX_PAGES = 40;
const MIN_COMPLETE_RELAYS = 2;
const PORTAL_TIMEOUT_MS = 8000;

export interface Portal {
  /** Shown to people (and the key of the portal). */
  host: string;
  /** Where the portal's server answers (lanaeco.farm redirects to www). */
  origin: string;
  /** The portal's public list of the units it shows. */
  unitsPath: string;
}

/** The portals /kje-potrosim links to, in the page's order (first one wins a tie). */
export const PORTALS: Portal[] = [
  { host: "lanaeco.farm", origin: "https://www.lanaeco.farm", unitsPath: "/api/eco-units" },
  { host: "lanaeco.shop", origin: "https://lanaeco.shop", unitsPath: "/api/eco-units" },
  { host: "lana.restaurant", origin: "https://lana.restaurant", unitsPath: "/api/eco-units" },
  { host: "lanabeauty.care", origin: "https://lanabeauty.care", unitsPath: "/api/eco-units" },
  { host: "lana.furniture", origin: "https://lana.furniture", unitsPath: "/api/eco-units" },
  { host: "lana.fashion", origin: "https://lana.fashion", unitsPath: "/api/eco-units" },
  { host: "lana.pet", origin: "https://lana.pet", unitsPath: "/api/eco-units" },
  { host: "lanamarket.place", origin: "https://lanamarket.place", unitsPath: "/api/market-units" },
  { host: "lana.events", origin: "https://lana.events", unitsPath: "/api/eco-units" },
  { host: "lana.construction", origin: "https://lana.construction", unitsPath: "/api/eco-units" },
  { host: "lana.kids", origin: "https://lana.kids", unitsPath: "/api/eco-units" },
  { host: "lana.vacations", origin: "https://lana.vacations", unitsPath: "/api/eco-units" },
];

// ─── relays ──────────────────────────────────────────────────────────────

function openRelay(url: string, timeoutMs: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    const t = setTimeout(() => {
      try { ws.terminate(); } catch { /* already closed */ }
      reject(new Error("connect timeout"));
    }, timeoutMs);
    ws.once("open", () => { clearTimeout(t); resolve(ws); });
    ws.once("error", (err) => { clearTimeout(t); reject(err); });
  });
}

/** One REQ. complete = the relay sent EOSE (not a timeout, CLOSED or a dropped socket). */
function relayPage(
  ws: WebSocket,
  subId: string,
  filter: Record<string, unknown>,
  timeoutMs: number,
): Promise<{ events: NostrEvent[]; complete: boolean }> {
  return new Promise((resolve) => {
    const events: NostrEvent[] = [];
    let done = false;
    const finish = (complete: boolean) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      ws.off("message", onMessage);
      ws.off("close", onClose);
      try { ws.send(JSON.stringify(["CLOSE", subId])); } catch { /* already closed */ }
      resolve({ events, complete });
    };
    const onMessage = (data: WebSocket.RawData) => {
      let msg: unknown;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (!Array.isArray(msg) || msg[1] !== subId) return;
      if (msg[0] === "EVENT" && msg[2]) events.push(msg[2] as NostrEvent);
      else if (msg[0] === "EOSE") finish(true);
      else if (msg[0] === "CLOSED") finish(false);
    };
    const onClose = () => finish(false);
    const timer = setTimeout(() => finish(false), timeoutMs);
    ws.on("message", onMessage);
    ws.on("close", onClose);
    try { ws.send(JSON.stringify(["REQ", subId, filter])); } catch { finish(false); }
  });
}

/** Every event of ONE kind on one relay, paged past the 500-per-REQ cap. */
export async function relayAllOfKind(
  ws: WebSocket,
  kind: number,
  extra: Record<string, unknown> = {},
  timeoutMs = PAGE_TIMEOUT_MS,
): Promise<{ events: NostrEvent[]; complete: boolean }> {
  const byId = new Map<string, NostrEvent>();
  let until: number | undefined;
  for (let page = 0; page < MAX_PAGES; page++) {
    const filter: Record<string, unknown> = { ...extra, kinds: [kind], limit: 500 };
    if (until !== undefined) filter.until = until;
    const { events, complete } = await relayPage(ws, `dir${kind}p${page}`, filter, timeoutMs);
    let added = 0;
    let oldest = Infinity;
    for (const ev of events) {
      if (!ev || !ev.id) continue;
      if (!byId.has(ev.id)) { byId.set(ev.id, ev); added++; }
      if (ev.created_at < oldest) oldest = ev.created_at;
    }
    if (!complete) return { events: [...byId.values()], complete: false };
    if (added === 0) return { events: [...byId.values()], complete: true };
    until = oldest;
  }
  return { events: [...byId.values()], complete: false }; // page cap hit: not trusted as complete
}

export async function fetchFromRelay(
  url: string,
  opts: { processorHex?: string; timeoutMs?: number } = {},
): Promise<{ complete: boolean; units: NostrEvent[]; statuses: NostrEvent[]; error?: string }> {
  const timeoutMs = opts.timeoutMs ?? PAGE_TIMEOUT_MS;
  let ws: WebSocket | null = null;
  try {
    ws = await openRelay(url, timeoutMs);
    const units = await relayAllOfKind(ws, 30901, {}, timeoutMs);
    const statuses = await relayAllOfKind(ws, 30903, { authors: [opts.processorHex || PROCESSOR_HEX] }, timeoutMs);
    // A relay that answers with nothing is a quiet relay, not an empty register.
    const complete = units.complete && statuses.complete && units.events.length > 0 && statuses.events.length > 0;
    return { complete, units: units.events, statuses: statuses.events };
  } catch (err) {
    return { complete: false, units: [], statuses: [], error: `${url}: ${(err as Error).message}` };
  } finally {
    try { ws?.close(); } catch { /* already closed */ }
  }
}

/** The relay list of the newest signed KIND 38888 (d=main); the bootstrap four if none. */
export async function relaysFromKind38888(bootstrap = BOOTSTRAP_RELAYS): Promise<string[]> {
  const found: NostrEvent[] = [];
  await Promise.all(bootstrap.map(async (url) => {
    let ws: WebSocket | null = null;
    try {
      ws = await openRelay(url, PAGE_TIMEOUT_MS);
      const { events } = await relayPage(ws, "dir38888", { kinds: [38888], authors: [KIND_38888_AUTHOR], "#d": ["main"], limit: 5 }, PAGE_TIMEOUT_MS);
      found.push(...events);
    } catch {
      // one relay down is fine; the others answer
    } finally {
      try { ws?.close(); } catch { /* already closed */ }
    }
  }));
  const newest = found
    .filter((ev) => ev && ev.kind === 38888 && ev.pubkey === KIND_38888_AUTHOR && tagValue(ev, "d") === "main" && isValidEvent(ev))
    .sort((a, b) => b.created_at - a.created_at)[0];
  const relays = newest
    ? [...new Set(newest.tags.filter((t) => t[0] === "relay" && /^wss:\/\/\S+$/.test(t[1] || "")).map((t) => t[1]))]
    : [];
  return relays.length > 0 ? relays : bootstrap;
}

// ─── portals ─────────────────────────────────────────────────────────────

export type PortalFetch = (portal: Portal) => Promise<unknown>;

const defaultPortalFetch: PortalFetch = async (portal) => {
  const res = await fetch(`${portal.origin}${portal.unitsPath}`, { signal: AbortSignal.timeout(PORTAL_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${portal.host}: HTTP ${res.status}`);
  return res.json();
};

/** Last good list per portal: a portal that is down keeps its links instead of losing them. */
const lastGoodPortalKeys = new Map<string, Set<string>>();

export async function portalMembership(
  portals: Portal[] = PORTALS,
  fetchPortal: PortalFetch = defaultPortalFetch,
  lastGood: Map<string, Set<string>> = lastGoodPortalKeys,
): Promise<Map<string, PortalRef>> {
  const lists = await Promise.all(portals.map(async (portal) => {
    try {
      const body = await fetchPortal(portal);
      if (!Array.isArray(body)) throw new Error(`${portal.host}: not a list`);
      const keys = new Set<string>();
      for (const u of body as Array<Record<string, unknown>>) {
        const owner = typeof u?.pubkey === "string" ? u.pubkey : "";
        const unit = typeof u?.unitId === "string" ? u.unitId : "";
        if (owner && unit) keys.add(unitKey(owner, unit));
      }
      lastGood.set(portal.host, keys);
      return keys;
    } catch (err) {
      console.warn("[providers] portal list unavailable:", (err as Error).message);
      return lastGood.get(portal.host) || new Set<string>();
    }
  }));
  const portalOf = new Map<string, PortalRef>();
  portals.forEach((portal, i) => {
    for (const key of lists[i]) {
      if (portalOf.has(key)) continue;
      const unitId = key.slice(key.indexOf(":") + 1);
      portalOf.set(key, { host: portal.host, url: `${portal.origin}/enota/${encodeURIComponent(unitId)}` });
    }
  });
  return portalOf;
}

// ─── the directory, cached ───────────────────────────────────────────────

export interface ProviderDirectory {
  providers: DirectoryProvider[];
  count: number;
  breakdown: DirectoryBreakdown;
  relays: { complete: number; of: number };
  countedAt: number;
}

const knownSimpleUnits = new Set<string>(); // sticky: once Simple, always Simple
const verifiedCache = new Map<string, boolean>(); // `${id}:${sig}` -> signature ok

export async function loadProviderDirectory(opts: {
  relays?: string[];
  portals?: Portal[];
  fetchPortal?: PortalFetch;
  processorHex?: string;
  timeoutMs?: number;
} = {}): Promise<ProviderDirectory> {
  const relays = opts.relays || (await relaysFromKind38888());
  const [results, portalOf] = await Promise.all([
    Promise.all(relays.map((url) => fetchFromRelay(url, { processorHex: opts.processorHex, timeoutMs: opts.timeoutMs }))),
    portalMembership(opts.portals || PORTALS, opts.fetchPortal || defaultPortalFetch),
  ]);
  const complete = results.filter((r) => r.complete).length;
  const need = Math.min(MIN_COMPLETE_RELAYS, relays.length);
  if (complete < need) {
    throw new Error(`only ${complete} of ${relays.length} relays answered completely ${results.map((r) => r.error).filter(Boolean).join("; ")}`);
  }
  const units = results.flatMap((r) => r.units);
  const statuses = results.flatMap((r) => r.statuses);
  const { providers, breakdown } = buildDirectory(units, statuses, {
    simpleKeys: knownSimpleUnits,
    verified: verifiedCache,
    processorHex: opts.processorHex,
    portalOf,
  });
  const current = new Set([...units, ...statuses].filter(Boolean).map(verifiedKey));
  for (const key of verifiedCache.keys()) if (!current.has(key)) verifiedCache.delete(key);
  console.log(`[providers] ${providers.length} listed (${breakdown.onAPortal} on a portal, ${breakdown.onNoPortal} on none), ${complete}/${relays.length} relays`);
  return { providers, count: providers.length, breakdown, relays: { complete, of: relays.length }, countedAt: Date.now() };
}

const TTL_MS = 5 * 60 * 1000;
const RETRY_MS = 60 * 1000;
const COLD_WAIT_MS = 20 * 1000;
const cache: { at: number; data: ProviderDirectory | null; inflight: Promise<ProviderDirectory | null> | null } = {
  at: 0,
  data: null,
  inflight: null,
};

/**
 * The last good directory right away, refreshed in the background when older than the
 * TTL; a failed refresh keeps it. Only before the very first read does a caller wait.
 */
export function getProviderDirectory(): Promise<ProviderDirectory | null> {
  if (Date.now() - cache.at >= TTL_MS && !cache.inflight) {
    cache.inflight = loadProviderDirectory()
      .then((data) => { cache.data = data; cache.at = Date.now(); return data; })
      .catch((err) => {
        console.warn("[providers]", (err as Error).message);
        cache.at = Date.now() - TTL_MS + RETRY_MS;
        return cache.data;
      })
      .finally(() => { cache.inflight = null; });
  }
  if (cache.data || !cache.inflight) return Promise.resolve(cache.data);
  return Promise.race([
    cache.inflight,
    new Promise<null>((r) => setTimeout(() => r(null), COLD_WAIT_MS)),
  ]);
}
