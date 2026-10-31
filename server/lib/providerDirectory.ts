/**
 * Every open Ekonomija Obilja provider, read from the relays: the list behind the
 * search on /kje-potrosim.
 *
 * Why (30. 10. 2026, Marjan: "QIFLOW by THV" cannot be found): /kje-potrosim only links
 * to the portals, and every portal shows only the categories in its own
 * PORTAL_CATEGORIES allowlist (server/routes/ecoUnits.ts in each LanaRetail repo). A
 * category that no portal lists (Body Arts & Movement, Other, B2B, Service(s),
 * Transport, Health & Wellbeing, ...) is on NO portal, so those providers could not be
 * found from this page at all, not even with a portal's search. The list here is built
 * from the relays, not from the portals, so a provider is in it whatever its category.
 *
 * Same register rules as lanapays.us (lana-s-abundant-economy/providerRegister.cjs):
 *   valid signature -> d == unit_id -> author pinned per unit (author of the oldest event)
 *   -> newest 30901 per unit
 *   -> status = newest processor-signed 30903 whose `a` names that owner and unit;
 *      open = active | quota_warning_*  (the portals' rule)
 *      PLUS quota_blocked (Brilly, 31. 10.): the monthly limit is reached, the provider
 *      is real and reopens next month, so it stays findable with monthlyLimitReached.
 *      QIFLOW by THV itself turned quota_blocked on 30. 10. 13:48 UTC. Suspended,
 *      rejected and every other status stay out.
 *   -> minus archived by the owner (30901 status other than active)
 *   -> minus LanaFund.Me payout units (KIND 30901 v1.1.0: portals must not list them)
 *   -> minus test / copy units (TEST / Kopija / Copy as a word in the name)
 *   -> minus LanaPays.Us Simple units (not Ekonomija Obilja; lanapays.us drops them too)
 *
 * Only public shop facts leave this module (name, category, place, website, picture,
 * where to find it). Bank, address, e-mail and phone tags are never copied out.
 */
import { getEventHash, verifyEvent } from "nostr-tools/pure";

export interface NostrEvent {
  id: string;
  pubkey: string;
  kind: number;
  created_at: number;
  content: string;
  tags: string[][];
  sig?: string;
}

/** KIND 30902 / 30903 are signed only by the LanaPays processor key. */
export const PROCESSOR_HEX = "79730aba75d71584e8a4f9d0cc1173085e75590ce489760078d2bf6f5210d692";
const SIMPLE_UNIT_TYPE = "simple.lanapays.us";
const TEST_NAME = /(^|[^\p{L}\p{N}])(test|kopija|copy)([^\p{L}\p{N}]|$)/iu;

/** Where a provider can be seen: one portal that lists it, and its page there. */
export interface PortalRef {
  host: string;
  url: string;
}

export interface DirectoryProvider {
  unitId: string;
  name: string;
  category: string;
  categoryDetail: string;
  city: string;
  country: string;
  website: string;
  image: string;
  /** The portal that lists this provider right now, or null when no portal does. */
  portal: PortalRef | null;
  /** Newest 30903 is quota_blocked: this month's limit is used up, it reopens next month. */
  monthlyLimitReached: boolean;
}

export interface DirectoryBreakdown {
  raw30901: number;
  invalidSignature: number;
  dNotUnitId: number;
  foreignAuthor: number;
  units: number;
  statusByLatest30903: Record<string, number>;
  open: number;
  /** quota_blocked units that passed the 30903 step (listed ones carry the flag). */
  quotaBlocked: number;
  archived: number;
  payoutOnly: number;
  test: number;
  simple: number;
  listed: number;
  onAPortal: number;
  onNoPortal: number;
}

export interface BuildOptions {
  /** owner:unit_id keys of units ever seen marked Simple (sticky between runs). */
  simpleKeys?: Set<string>;
  /** `${id}:${sig}` -> signature ok, reused so each event's signature is checked once. */
  verified?: Map<string, boolean>;
  /** The only key whose 30903 counts (tests pass their own). */
  processorHex?: string;
  /** owner:unit_id -> the portal that lists it (from the portals' own public lists). */
  portalOf?: Map<string, PortalRef>;
}

export function tagValue(ev: NostrEvent | null | undefined, name: string): string {
  const tags = ev && Array.isArray(ev.tags) ? ev.tags : [];
  const tag = tags.find((t) => Array.isArray(t) && t[0] === name);
  return tag && typeof tag[1] === "string" ? tag[1] : "";
}

const tagValues = (ev: NostrEvent, name: string): string[] =>
  (Array.isArray(ev.tags) ? ev.tags : [])
    .filter((t) => Array.isArray(t) && t[0] === name && typeof t[1] === "string")
    .map((t) => t[1]);

export const unitKey = (ownerHex: string, unitId: string): string =>
  `${String(ownerHex || "").trim().toLowerCase()}:${String(unitId || "").trim()}`;

/**
 * NIP-01 id + BIP-340 signature. Checked on a fresh object: nostr-tools caches its
 * verdict on the event under a symbol, and a copy made with spread would carry it.
 */
export function isValidEvent(ev: NostrEvent): boolean {
  try {
    if (!ev || typeof ev.id !== "string" || typeof ev.sig !== "string") return false;
    return verifyEvent({
      id: ev.id,
      pubkey: ev.pubkey,
      created_at: ev.created_at,
      kind: ev.kind,
      tags: ev.tags,
      content: ev.content,
      sig: ev.sig,
    });
  } catch {
    return false;
  }
}

/** Key of the cached signature verdict (see buildDirectory). */
export const verifiedKey = (ev: NostrEvent): string => `${ev.id}:${ev.sig}`;

export const isSimpleUnitEvent =(ev: NostrEvent): boolean =>
  tagValue(ev, "unit_type").trim().toLowerCase() === SIMPLE_UNIT_TYPE ||
  tagValue(ev, "lana_only").trim().toLowerCase() === "true";

const isPayoutOnlyEvent = (ev: NostrEvent): boolean =>
  tagValue(ev, "unit_type").trim().toLowerCase() === "lanafund.me" ||
  tagValue(ev, "category").trim().toLowerCase() === "lanafund.me";

const isTestUnitEvent = (ev: NostrEvent): boolean => TEST_NAME.test(tagValue(ev, "name"));

const isOpenStatus = (status: string): boolean => status === "active" || status.startsWith("quota_warning");
/** Monthly limit used up: listed, flagged, not hidden (it reopens on the 1st). */
const QUOTA_BLOCKED = "quota_blocked";

const httpsOnly = (raw: string): string => (/^https:\/\/\S+$/i.test(raw.trim()) ? raw.trim() : "");

/** A merchant types "www.shop.si" as often as "https://shop.si"; anything else is dropped. */
export function websiteOf(raw: string): string {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\/[^\s]+\.[^\s]+$/i.test(v)) return v;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/[^\s]*)?$/i.test(v)) return `https://${v}`;
  return "";
}

function imageOf(ev: NostrEvent): string {
  for (const name of ["thumb", "logo_thumb", "image", "logo"]) {
    for (const v of tagValues(ev, name)) {
      const url = httpsOnly(v);
      if (url) return url;
    }
  }
  return "";
}

/** Alphabetical by name, Slovenian alphabet (č, š, ž in their place). */
const byName = new Intl.Collator("sl", { sensitivity: "base" });

/**
 * @param units30901  every KIND 30901 from every relay (duplicates allowed)
 * @param status30903 every KIND 30903 from every relay (duplicates allowed)
 */
export function buildDirectory(
  units30901: NostrEvent[],
  status30903: NostrEvent[],
  opts: BuildOptions = {},
): { providers: DirectoryProvider[]; breakdown: DirectoryBreakdown } {
  const simpleKeys = opts.simpleKeys || new Set<string>();
  const verified = opts.verified || new Map<string, boolean>();
  const processorHex = opts.processorHex || PROCESSOR_HEX;
  const portalOf = opts.portalOf || new Map<string, PortalRef>();
  // The id is recomputed from the content every time (cheap), so a forged twin that
  // reuses a real event's id fails here; only the schnorr verdict is cached, keyed by
  // id + sig (the pubkey is inside the hashed content).
  const valid = (ev: NostrEvent): boolean => {
    if (!ev || typeof ev.id !== "string" || typeof ev.sig !== "string") return false;
    try {
      if (getEventHash(ev) !== ev.id) return false;
    } catch {
      return false;
    }
    const key = verifiedKey(ev);
    if (!verified.has(key)) verified.set(key, isValidEvent(ev));
    return verified.get(key) === true;
  };
  // Check first, then de-duplicate: a forged twin that arrives first must not evict the real one.
  let invalid = 0;
  const checked = (events: NostrEvent[], kind: number): NostrEvent[] => {
    const byId = new Map<string, NostrEvent>();
    for (const ev of events || []) {
      if (!ev || ev.kind !== kind || byId.has(ev.id)) continue;
      if (valid(ev)) byId.set(ev.id, ev);
      else if (kind === 30901) invalid++;
    }
    return [...byId.values()];
  };

  const ok1 = checked(units30901, 30901);
  // d must equal unit_id (otherwise a "shadow slot" can collide with somebody else's unit).
  const shaped = ok1.filter((ev) => tagValue(ev, "d") && tagValue(ev, "d") === tagValue(ev, "unit_id"));

  const byUnit = new Map<string, NostrEvent[]>();
  for (const ev of shaped) {
    const d = tagValue(ev, "d");
    if (!byUnit.has(d)) byUnit.set(d, []);
    byUnit.get(d)!.push(ev);
  }
  // Author pin (TOFU): the author of the oldest event we have for the unit; others are ignored.
  let foreignAuthor = 0;
  const newest = new Map<string, NostrEvent>();
  for (const events of byUnit.values()) {
    const pinned = events.reduce((a, b) => (b.created_at < a.created_at ? b : a)).pubkey;
    const own = events.filter((ev) => ev.pubkey === pinned);
    foreignAuthor += events.length - own.length;
    for (const ev of own) if (isSimpleUnitEvent(ev)) simpleKeys.add(unitKey(ev.pubkey, tagValue(ev, "d")));
    const last = own.reduce((a, b) => (b.created_at > a.created_at ? b : a));
    newest.set(unitKey(last.pubkey, tagValue(last, "d")), last);
  }

  // The registrar's word about ONE shop: processor-signed, `a` = 30901:<owner>:<unit>.
  const statusOf = new Map<string, NostrEvent>();
  for (const ev of checked((status30903 || []).filter((ev) => ev && ev.pubkey === processorHex), 30903)) {
    const [kind, owner, unit] = tagValue(ev, "a").split(":");
    if (kind !== "30901" || !owner || !unit || unit !== tagValue(ev, "d")) continue;
    const key = unitKey(owner, unit);
    const cur = statusOf.get(key);
    if (!cur || ev.created_at > cur.created_at) statusOf.set(key, ev);
  }

  const statuses: Record<string, number> = {};
  const removed = { archived: 0, payoutOnly: 0, test: 0, simple: 0 };
  let open = 0;
  let quotaBlocked = 0;
  const providers: DirectoryProvider[] = [];
  for (const [key, ev] of newest) {
    const s = statusOf.get(key);
    const status = s ? tagValue(s, "status").trim().toLowerCase() || "unknown" : "none";
    statuses[status] = (statuses[status] || 0) + 1;
    const monthlyLimitReached = status === QUOTA_BLOCKED;
    if (monthlyLimitReached) quotaBlocked++;
    else if (isOpenStatus(status)) open++;
    else continue;
    const ownStatus = tagValue(ev, "status").trim().toLowerCase();
    if (ownStatus && ownStatus !== "active") { removed.archived++; continue; }
    if (isPayoutOnlyEvent(ev)) { removed.payoutOnly++; continue; }
    if (isTestUnitEvent(ev)) { removed.test++; continue; }
    if (simpleKeys.has(key)) { removed.simple++; continue; }
    const name = tagValue(ev, "name").trim();
    if (!name) continue;
    providers.push({
      unitId: tagValue(ev, "d"),
      name,
      category: tagValue(ev, "category").trim(),
      categoryDetail: tagValue(ev, "category_detail").trim(),
      city: tagValue(ev, "receiver_city").trim(),
      country: (tagValue(ev, "country") || tagValue(ev, "receiver_country")).trim().toUpperCase(),
      website: websiteOf(tagValue(ev, "url")),
      image: imageOf(ev),
      portal: portalOf.get(key) || null,
      monthlyLimitReached,
    });
  }
  providers.sort((a, b) => byName.compare(a.name, b.name));

  const onAPortal = providers.filter((p) => p.portal).length;
  return {
    providers,
    breakdown: {
      raw30901: ok1.length + invalid,
      invalidSignature: invalid,
      dNotUnitId: ok1.length - shaped.length,
      foreignAuthor,
      units: newest.size,
      statusByLatest30903: statuses,
      open,
      quotaBlocked,
      archived: removed.archived,
      payoutOnly: removed.payoutOnly,
      test: removed.test,
      simple: removed.simple,
      listed: providers.length,
      onAPortal,
      onNoPortal: providers.length - onAPortal,
    },
  };
}
