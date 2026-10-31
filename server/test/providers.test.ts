/**
 * The provider search on /kje-potrosim (30. 10. 2026).
 *
 * Before: the page only linked to the portals, and a provider whose category no
 * portal lists (QIFLOW by THV: "Body Arts & Movement") could not be found from it at
 * all. These tests pin that every open provider is in the directory whatever its
 * category, with the same register rules as lanapays.us, and that the relay read
 * gets past the 500-events-per-REQ cap.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { WebSocketServer } from "ws";
import { finalizeEvent, generateSecretKey, getPublicKey } from "nostr-tools/pure";
import { buildDirectory, unitKey, websiteOf, type NostrEvent } from "../lib/providerDirectory.js";
import { fetchFromRelay, loadProviderDirectory, portalMembership, type Portal } from "../lib/providerSource.js";
import { linkOf, normalizeForSearch, searchProviders } from "../../src/lib/providerSearch.js";

const processorSk = generateSecretKey();
const PROCESSOR = getPublicKey(processorSk);
let clock = 1_790_000_000;

const sign = (sk: Uint8Array, kind: number, tags: string[][], created_at = clock++, content = ""): NostrEvent =>
  finalizeEvent({ kind, tags, content, created_at }, sk) as unknown as NostrEvent;

function unit(sk: Uint8Array, id: string, name: string, category: string, extra: string[][] = [], created_at?: number): NostrEvent {
  return sign(sk, 30901, [
    ["d", id], ["unit_id", id], ["name", name], ["owner_hex", getPublicKey(sk)],
    ["category", category], ["receiver_city", "Ljubljana"], ["country", "SI"], ["status", "active"],
    ["bank_account", "SI56000000000000000"], ["email", "owner@example.com"], ["phone", "+38600000000"],
    ...extra,
  ], created_at);
}

const status = (ownerSk: Uint8Array, id: string, value: string, signer = processorSk, created_at?: number): NostrEvent =>
  sign(signer, 30903, [["d", id], ["unit_id", id], ["a", `30901:${getPublicKey(ownerSk)}:${id}`], ["status", value]], created_at);

const names = (list: { name: string }[]) => list.map((p) => p.name);

test("a provider in a category no portal lists (QIFLOW by THV, Body Arts & Movement) is in the directory", () => {
  const sk = generateSecretKey();
  const u = unit(sk, "cf4204d4", "QIFLOW by THV", "Body Arts & Movement", [["url", "https://taijiquan-qigong.si/"]]);
  const { providers, breakdown } = buildDirectory([u], [status(sk, "cf4204d4", "active")], { processorHex: PROCESSOR });
  assert.deepEqual(names(providers), ["QIFLOW by THV"]);
  assert.equal(providers[0].category, "Body Arts & Movement");
  assert.equal(providers[0].portal, null);
  assert.equal(providers[0].website, "https://taijiquan-qigong.si/");
  assert.equal(breakdown.onNoPortal, 1);
  // and the search on the page finds it
  assert.deepEqual(names(searchProviders(providers, "qiflow")), ["QIFLOW by THV"]);
  assert.equal(linkOf(providers[0]), "https://taijiquan-qigong.si/");
});

test("a provider a portal lists links to its page on that portal", () => {
  const sk = generateSecretKey();
  const u = unit(sk, "beauty1", "Salon Lepota", "Care - Beauty - Health - Wellness", [["url", "www.salon.si"]]);
  const portalOf = new Map([[unitKey(getPublicKey(sk), "beauty1"), { host: "lanabeauty.care", url: "https://lanabeauty.care/enota/beauty1" }]]);
  const { providers } = buildDirectory([u], [status(sk, "beauty1", "active")], { processorHex: PROCESSOR, portalOf });
  assert.equal(providers[0].portal?.host, "lanabeauty.care");
  assert.equal(linkOf(providers[0]), "https://lanabeauty.care/enota/beauty1");
  assert.equal(providers[0].website, "https://www.salon.si");
});

test("only open units of Ekonomija Obilja are listed (same rules as lanapays.us)", () => {
  const keys = Array.from({ length: 10 }, () => generateSecretKey());
  const units = [
    unit(keys[0], "u0", "Odprta", "Producer"),
    unit(keys[1], "u1", "Opozorilo kvote", "Shop"),
    unit(keys[2], "u2", "Suspendirana", "Shop"),
    unit(keys[3], "u3", "Brez statusa", "Shop"),
    unit(keys[4], "u4", "Arhivirana", "Shop", [["status", "archived"]]),
    unit(keys[5], "u5", "Martin izplačila", "LanaFund.Me"),
    unit(keys[6], "u6", "Lesene igrače (TEST)", "Kids"),
    unit(keys[7], "u7", "Simple trgovina", "Services", [["unit_type", "simple.lanapays.us"], ["lana_only", "true"]]),
    unit(keys[8], "u8", "Zavrnjena", "Other"),
    unit(keys[9], "u9", "Testenine Mojca", "Food & Drink"), // "Testenine" is not the word TEST
  ];
  // u4: archived means the owner's own status tag, which comes after the default one
  units[4].tags = units[4].tags.filter((t) => !(t[0] === "status" && t[1] === "active"));
  units[4] = sign(keys[4], 30901, units[4].tags);
  const statuses = [
    status(keys[0], "u0", "active"),
    status(keys[1], "u1", "quota_warning_80"),
    status(keys[2], "u2", "suspended"),
    status(keys[4], "u4", "active"),
    status(keys[5], "u5", "active"),
    status(keys[6], "u6", "active"),
    status(keys[7], "u7", "active"),
    status(keys[8], "u8", "rejected"),
    status(keys[9], "u9", "active"),
  ];
  const { providers, breakdown } = buildDirectory(units, statuses, { processorHex: PROCESSOR });
  assert.deepEqual(names(providers), ["Odprta", "Opozorilo kvote", "Testenine Mojca"]);
  assert.equal(breakdown.archived, 1);
  assert.equal(breakdown.payoutOnly, 1);
  assert.equal(breakdown.test, 1);
  assert.equal(breakdown.simple, 1);
  assert.deepEqual(breakdown.statusByLatest30903, { active: 6, quota_warning_80: 1, suspended: 1, none: 1, rejected: 1 });
  assert.equal(breakdown.open, 7);
});

test("monthly limit reached (quota_blocked) is still listed, flagged; suspended / rejected / archived / test / Simple / LanaFund.Me are not", () => {
  // QIFLOW by THV turned quota_blocked on 30. 10. 13:48 UTC: the provider Marjan asked about.
  const k = Array.from({ length: 8 }, () => generateSecretKey());
  const archived = sign(k[3], 30901, [["d", "q3"], ["unit_id", "q3"], ["name", "Arhivirana na meji"], ["category", "Shop"], ["status", "archived"]]);
  const units = [
    unit(k[0], "q0", "QIFLOW by THV", "Body Arts & Movement"),
    unit(k[1], "q1", "Odprta", "Producer"),
    unit(k[2], "q2", "Suspendirana", "Shop"),
    archived,
    unit(k[4], "q4", "Meja (TEST)", "Shop"),
    unit(k[5], "q5", "Simple na meji", "Services", [["lana_only", "true"]]),
    unit(k[6], "q6", "Izplačila na meji", "LanaFund.Me"),
    unit(k[7], "q7", "Zavrnjena", "Other"),
  ];
  const statuses = [
    status(k[0], "q0", "active", processorSk, clock + 10),
    status(k[0], "q0", "quota_blocked", processorSk, clock + 20), // newest wins
    status(k[1], "q1", "active"),
    status(k[2], "q2", "suspended"),
    status(k[3], "q3", "quota_blocked"),
    status(k[4], "q4", "quota_blocked"),
    status(k[5], "q5", "quota_blocked"),
    status(k[6], "q6", "quota_blocked"),
    status(k[7], "q7", "rejected"),
  ];
  const { providers, breakdown } = buildDirectory(units, statuses, { processorHex: PROCESSOR });
  assert.deepEqual(names(providers), ["Odprta", "QIFLOW by THV"]);
  assert.equal(providers.find((p) => p.name === "QIFLOW by THV")?.monthlyLimitReached, true);
  assert.equal(providers.find((p) => p.name === "Odprta")?.monthlyLimitReached, false);
  assert.equal(breakdown.quotaBlocked, 5);
  assert.equal(breakdown.open, 1);
  assert.deepEqual(names(searchProviders(providers, "qiflow")), ["QIFLOW by THV"]);
});

test("the newest 30903 decides; a 30903 from anyone but the processor, or about another owner, does not count", () => {
  const sk = generateSecretKey();
  const stranger = generateSecretKey();
  const u = unit(sk, "x1", "Kmetija", "Producer");
  const later = status(sk, "x1", "suspended", processorSk, clock + 100);
  const earlier = status(sk, "x1", "active", processorSk, clock + 50);
  assert.deepEqual(names(buildDirectory([u], [later, earlier], { processorHex: PROCESSOR }).providers), []);

  const forgedActive = status(sk, "x1", "active", stranger, clock + 200);
  assert.deepEqual(names(buildDirectory([u], [later, forgedActive], { processorHex: PROCESSOR }).providers), []);

  const otherOwner = generateSecretKey();
  const aboutSomeoneElse = sign(processorSk, 30903, [["d", "x1"], ["a", `30901:${getPublicKey(otherOwner)}:x1`], ["status", "active"]]);
  assert.deepEqual(names(buildDirectory([u], [aboutSomeoneElse], { processorHex: PROCESSOR }).providers), []);
});

test("a forged or foreign 30901 does not change or add a provider", () => {
  const sk = generateSecretKey();
  const stranger = generateSecretKey();
  const real = unit(sk, "f1", "Prava trgovina", "Shop", [], clock);
  // Same d, newer, other author: the author is pinned to the oldest event of the unit.
  const hijack = unit(stranger, "f1", "Ugrabljena", "Shop", [], clock + 500);
  // Spread copy of a signed event (same id, same sig, nostr-tools' "verified" mark
  // copied along) with a changed name: it must not pass, and arriving FIRST it must not
  // push the real event out.
  const forged = { ...real, tags: real.tags.map((t) => (t[0] === "name" ? ["name", "Ponaredek"] : t)) };
  const st = status(sk, "f1", "active");
  const { providers, breakdown } = buildDirectory([forged, real, hijack], [st], { processorHex: PROCESSOR });
  assert.deepEqual(names(providers), ["Prava trgovina"]);
  assert.equal(breakdown.invalidSignature, 1);
  assert.equal(breakdown.foreignAuthor, 1);
});

test("a cached 'signature ok' for a real event is not reused for a forged twin with the same id", () => {
  const sk = generateSecretKey();
  const real = unit(sk, "c1", "Prava", "Shop");
  const st = status(sk, "c1", "active");
  const verified = new Map<string, boolean>();
  assert.deepEqual(names(buildDirectory([real], [st], { processorHex: PROCESSOR, verified }).providers), ["Prava"]);
  const forged = { ...real, tags: real.tags.map((t) => (t[0] === "name" ? ["name", "Ponaredek"] : t)) };
  assert.deepEqual(names(buildDirectory([forged], [st], { processorHex: PROCESSOR, verified }).providers), []);
});

test("a unit once seen as Simple stays Simple (the shop's edit form drops the tags)", () => {
  const sk = generateSecretKey();
  const v1 = unit(sk, "s1", "Bila Simple", "Services", [["lana_only", "true"]], clock);
  const v2 = unit(sk, "s1", "Bila Simple", "Services", [], clock + 10);
  const simpleKeys = new Set<string>();
  const first = buildDirectory([v1, v2], [status(sk, "s1", "active")], { processorHex: PROCESSOR, simpleKeys });
  assert.deepEqual(names(first.providers), []);
  // next refresh: the relays only have v2 now
  const second = buildDirectory([v2], [status(sk, "s1", "active")], { processorHex: PROCESSOR, simpleKeys });
  assert.deepEqual(names(second.providers), []);
});

test("no bank account, e-mail or phone leaves the directory", () => {
  const sk = generateSecretKey();
  const { providers } = buildDirectory([unit(sk, "p1", "Zasebnost", "Shop")], [status(sk, "p1", "active")], { processorHex: PROCESSOR });
  const json = JSON.stringify(providers);
  assert.ok(!json.includes("SI56000000000000000"));
  assert.ok(!json.includes("owner@example.com"));
  assert.ok(!json.includes("+38600000000"));
});

test("sorted by name in the Slovenian alphabet; websites without https are fixed or dropped", () => {
  const ks = [generateSecretKey(), generateSecretKey(), generateSecretKey()];
  const units = [unit(ks[0], "a", "Čebelarstvo", "Producer"), unit(ks[1], "b", "Cvetje", "Producer"), unit(ks[2], "c", "Dom", "Producer")];
  const { providers } = buildDirectory(units, [status(ks[0], "a", "active"), status(ks[1], "b", "active"), status(ks[2], "c", "active")], { processorHex: PROCESSOR });
  assert.deepEqual(names(providers), ["Cvetje", "Čebelarstvo", "Dom"]);
  assert.equal(websiteOf("www.sophisticated-simple.life"), "https://www.sophisticated-simple.life");
  assert.equal(websiteOf("javascript:alert(1)"), "");
  assert.equal(websiteOf("pokliči me"), "");
});

test("search: any word in name, category, activity, town; no case or diacritics needed", () => {
  const list = [
    { unitId: "1", name: "QIFLOW by THV", category: "Body Arts & Movement", categoryDetail: "Taijiquan and Qigong, mandalas", city: "Ljubljana", country: "SI", website: "", image: "", portal: null },
    { unitId: "2", name: "Čokoladnica Žužemberk", category: "Shop", categoryDetail: "", city: "Žužemberk", country: "SI", website: "", image: "", portal: null },
    { unitId: "3", name: "Plesna šola Country Lajf", category: "Body Arts & Movement", categoryDetail: "ples", city: "Maribor", country: "SI", website: "", image: "", portal: null },
  ];
  assert.deepEqual(names(searchProviders(list, "QiFlow")), ["QIFLOW by THV"]);
  assert.deepEqual(names(searchProviders(list, "cokoladnica zuzemberk")), ["Čokoladnica Žužemberk"]);
  assert.deepEqual(names(searchProviders(list, "qigong")), ["QIFLOW by THV"]);
  assert.deepEqual(names(searchProviders(list, "movement maribor")), ["Plesna šola Country Lajf"]);
  assert.deepEqual(names(searchProviders(list, "   ")), names(list));
  assert.deepEqual(names(searchProviders(list, "plesna")), ["Plesna šola Country Lajf"]);
  assert.equal(normalizeForSearch("  ČŠŽ  đ "), "csz d");
});

// ─── relays ──────────────────────────────────────────────────────────────

/** A relay like strfry: newest first, at most `cap` events per REQ whatever `limit` says. */
async function fakeRelay(events: NostrEvent[], cap = 500): Promise<{ url: string; close: () => Promise<void> }> {
  const wss = new WebSocketServer({ port: 0, host: "127.0.0.1" });
  await new Promise<void>((r) => wss.once("listening", () => r()));
  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg[0] !== "REQ") return;
      const [, sub, f] = msg;
      const d = (e: NostrEvent) => (e.tags.find((t) => t[0] === "d") || [])[1];
      const out = events
        .filter((e) => (!f.kinds || f.kinds.includes(e.kind))
          && (!f.authors || f.authors.includes(e.pubkey))
          && (f.until === undefined || e.created_at <= f.until)
          && (!f["#d"] || f["#d"].includes(d(e))))
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, Math.min(f.limit ?? cap, cap));
      for (const e of out) ws.send(JSON.stringify(["EVENT", sub, e]));
      ws.send(JSON.stringify(["EOSE", sub]));
    });
  });
  const { port } = wss.address() as { port: number };
  return { url: `ws://127.0.0.1:${port}`, close: () => new Promise((r) => wss.close(() => r())) };
}

function bigNetwork(nUnits: number, nDeletions: number) {
  const units: NostrEvent[] = [];
  const statuses: NostrEvent[] = [];
  const deletions: NostrEvent[] = [];
  const base = 1_780_000_000;
  for (let i = 0; i < nUnits; i++) {
    const sk = generateSecretKey();
    // two units per second: `until` is inclusive and must not lose same-second events
    units.push(unit(sk, `unit${i}`, `Ponudnik ${String(i).padStart(4, "0")}`, i === 0 ? "Body Arts & Movement" : "Producer", [], base + Math.floor(i / 2)));
    statuses.push(status(sk, `unit${i}`, "active", processorSk, base + Math.floor(i / 2)));
  }
  const delSk = generateSecretKey();
  for (let i = 0; i < nDeletions; i++) deletions.push(sign(delSk, 5, [["e", "00".repeat(32)]], base + nUnits + i));
  return { units, statuses, deletions };
}

test("relay read pages past 500 per REQ, and KIND 5 traffic does not crowd units out", async () => {
  const { units, statuses, deletions } = bigNetwork(620, 800);
  const relay = await fakeRelay([...units, ...statuses, ...deletions]);
  try {
    const got = await fetchFromRelay(relay.url, { processorHex: PROCESSOR, timeoutMs: 5000 });
    assert.equal(got.complete, true);
    assert.equal(new Set(got.units.map((e) => e.id)).size, 620);
    assert.equal(new Set(got.statuses.map((e) => e.id)).size, 620);
  } finally {
    await relay.close();
  }
});

test("the whole directory from two relays: every open unit listed, QIFLOW-like unit included", async () => {
  const { units, statuses, deletions } = bigNetwork(620, 800);
  const a = await fakeRelay([...units, ...statuses, ...deletions]);
  const b = await fakeRelay([...units.slice(0, 300), ...statuses]); // a lagging relay
  try {
    const dir = await loadProviderDirectory({
      relays: [a.url, b.url],
      portals: [],
      processorHex: PROCESSOR,
      timeoutMs: 5000,
    });
    assert.equal(dir.count, 620);
    assert.equal(dir.relays.complete, 2);
    assert.ok(dir.providers.some((p) => p.category === "Body Arts & Movement"));
  } finally {
    await a.close();
    await b.close();
  }
});

test("a quiet or dead relay is not an empty register: fewer than 2 complete relays is an error", async () => {
  const quiet = await fakeRelay([]);
  try {
    await assert.rejects(
      loadProviderDirectory({ relays: [quiet.url, "ws://127.0.0.1:1"], portals: [], processorHex: PROCESSOR, timeoutMs: 2000 }),
      /only 0 of 2 relays/,
    );
  } finally {
    await quiet.close();
  }
});

test("portal links come from the portals' own lists; a portal that is down keeps its last good list", async () => {
  const portals: Portal[] = [
    { host: "lanabeauty.care", origin: "https://lanabeauty.care", unitsPath: "/api/eco-units" },
    { host: "lanamarket.place", origin: "https://lanamarket.place", unitsPath: "/api/market-units" },
  ];
  const owner = "ab".repeat(32);
  const lastGood = new Map<string, Set<string>>();
  let up = true;
  const fetchPortal = async (p: Portal) => {
    if (!up) throw new Error(`${p.host}: down`);
    return p.host === "lanabeauty.care" ? [{ pubkey: owner, unitId: "u1" }] : [{ pubkey: owner, unitId: "u1" }, { pubkey: owner, unitId: "u2" }];
  };
  const first = await portalMembership(portals, fetchPortal, lastGood);
  assert.equal(first.get(unitKey(owner, "u1"))?.url, "https://lanabeauty.care/enota/u1"); // first portal wins
  assert.equal(first.get(unitKey(owner, "u2"))?.url, "https://lanamarket.place/enota/u2");
  up = false;
  const second = await portalMembership(portals, fetchPortal, lastGood);
  assert.equal(second.get(unitKey(owner, "u2"))?.host, "lanamarket.place");
});
