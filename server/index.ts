/**
 * Landing Page Customers — Express server
 * Serves static SPA + proxies WIF balance/registration calls to lana-pays-check.
 *
 * Port: 3008  (in production behind nginx-proxy on https://www.mejmosefajn.org)
 *
 * Why proxy and not direct browser → check.lanapays.us calls?
 * → check.lanapays.us has no CORS headers, so a different origin is blocked.
 *   In Docker prod, this server reaches lana-pays-check via internal hostname
 *   `http://lana-pays-check-web:3007`. In dev, it falls back to the public URL.
 */

import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { fetchKind0Profile, broadcastEvent, fetchCalendarEvents, type NostrEvent } from "./lib/nostr.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.SERVER_PORT || process.env.PORT || "3008", 10);
const UPSTREAM = (process.env.LANA_PAYS_CHECK_URL || "https://check.lanapays.us").replace(/\/$/, "");

const app = express();
app.use(express.json());

// ─── Health ──────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "landing-page-customers",
    port: PORT,
    upstream: UPSTREAM,
  });
});

// ─── Proxy: registration check ───────────────────────────
app.post("/api/check-wallet", async (req, res) => {
  try {
    const upstream = await fetch(`${UPSTREAM}/api/check-wallet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[proxy] check-wallet failed:", err);
    res.status(502).json({ error: "Upstream unavailable" });
  }
});

// ─── Proxy: balance (FIAT-aware) ─────────────────────────
app.get("/api/balance/:address", async (req, res) => {
  const { address } = req.params;
  const currency = (req.query.currency as string) || "EUR";
  if (!address) return res.status(400).json({ error: "Missing address" });

  try {
    const url = `${UPSTREAM}/api/balance/${encodeURIComponent(address)}?currency=${encodeURIComponent(currency)}`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[proxy] balance failed:", err);
    res.status(502).json({ error: "Upstream unavailable" });
  }
});

// ─── Profile: fetch KIND 0 from relays ───────────────────
app.get("/api/profile/:hexId", async (req, res) => {
  const { hexId } = req.params;
  if (!hexId || hexId.length !== 64 || !/^[0-9a-f]+$/.test(hexId)) {
    return res.status(400).json({ error: "Invalid hex ID" });
  }
  try {
    const profile = await fetchKind0Profile(hexId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("[profile] fetch failed:", err);
    res.status(502).json({ error: "Relay unavailable" });
  }
});

// ─── Calendar events (KIND 36677) — cached relay fetch ───
let eventsCache: { at: number; events: NostrEvent[] } | null = null;
const EVENTS_TTL = 5 * 60 * 1000; // 5 min

app.get("/api/events", async (_req, res) => {
  try {
    if (eventsCache && Date.now() - eventsCache.at < EVENTS_TTL) {
      return res.json({ events: eventsCache.events, cached: true });
    }
    const events = await fetchCalendarEvents();
    // Only refresh the cache when relays actually returned something,
    // so a transient relay hiccup doesn't blank the section.
    if (events.length > 0 || !eventsCache) {
      eventsCache = { at: Date.now(), events };
    }
    res.json({ events: eventsCache!.events, cached: false });
  } catch (err) {
    console.error("[events] fetch failed:", err);
    res.status(502).json({ error: "Relay unavailable", events: [] });
  }
});

// ─── Broadcast pre-signed Nostr event to relays ──────────
app.post("/api/broadcast-event", async (req, res) => {
  const { event } = req.body;
  if (!event || !event.id || !event.pubkey || !event.sig) {
    return res.status(400).json({ error: "Invalid event" });
  }
  try {
    const result = await broadcastEvent(event);
    res.json({ success: result.success.length > 0, relays: result });
  } catch (err) {
    console.error("[broadcast] failed:", err);
    res.status(502).json({ error: "Broadcast failed" });
  }
});

// ─── Proxy: buyer purchase history (KIND 30933 from relays) ──
// lana-pays-check does all the relay work; we just forward. Slower than the
// other proxies (upstream queries relays), so give it a generous timeout.
app.get("/api/purchases/:hexId", async (req, res) => {
  const { hexId } = req.params;
  if (!hexId || hexId.length !== 64 || !/^[0-9a-f]+$/.test(hexId)) {
    return res.status(400).json({ error: "Invalid hex ID" });
  }
  try {
    const upstream = await fetch(`${UPSTREAM}/api/purchases/${encodeURIComponent(hexId)}`, {
      signal: AbortSignal.timeout(30000),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[proxy] purchases failed:", err);
    res.status(502).json({ error: "Upstream unavailable" });
  }
});

// ─── Proxy: account/wallet list (for frozen status) ──────
app.get("/api/wallets/:hexId", async (req, res) => {
  const { hexId } = req.params;
  if (!hexId) return res.status(400).json({ error: "Missing hexId" });

  try {
    const upstream = await fetch(`${UPSTREAM}/api/wallets/${encodeURIComponent(hexId)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    console.error("[proxy] wallets failed:", err);
    res.status(502).json({ error: "Upstream unavailable" });
  }
});

// ─── Static SPA + history fallback ───────────────────────
const distDir = path.resolve(__dirname, "../dist");
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  // Express 5: use named-wildcard pattern, not "*"
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`[landing-page-customers] listening on :${PORT}`);
  console.log(`[landing-page-customers] upstream=${UPSTREAM}`);
});
