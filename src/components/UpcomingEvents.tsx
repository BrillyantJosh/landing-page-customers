import { useEffect, useState } from "react";
import { Calendar, MapPin, Globe, ExternalLink, Loader2 } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

interface NostrEvent {
  id: string;
  pubkey: string;
  kind: number;
  created_at: number;
  content: string;
  tags: string[][];
}

interface Occurrence {
  start: Date;
  end: Date | null;
}

interface NormalizedEvent {
  event: NostrEvent;
  occurrence: Occurrence;
}

const tag = (e: NostrEvent, name: string): string => {
  const found = (e.tags || []).find((x) => x[0] === name);
  return found ? found[1] || "" : "";
};
const tagsOf = (e: NostrEvent, name: string) => (e.tags || []).filter((x) => x[0] === name);

const toDate = (v: string): Date | null => {
  const d = new Date(v || "");
  return Number.isNaN(d.getTime()) ? null : d;
};

const nextOccurrence = (e: NostrEvent): Occurrence | null => {
  const now = Date.now();
  const grace = 24 * 60 * 60 * 1000;
  const schedule = tagsOf(e, "schedule")
    .map((x) => ({ start: toDate(x[1]), end: toDate(x[2] || x[1]) }))
    .filter((s): s is Occurrence => !!s.start);

  if (schedule.length) {
    return (
      schedule
        .filter((s) => s.start.getTime() >= now - grace)
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0] || null
    );
  }
  const start = toDate(tag(e, "start"));
  if (!start || start.getTime() < now - grace) return null;
  return { start, end: toDate(tag(e, "end")) || start };
};

const absolutize = (v: string): string => {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/")) return `https://lanapays.us${v}`;
  return v;
};

const onlineLinkOf = (e: NostrEvent) => absolutize(tag(e, "online"));
const linkOf = (e: NostrEvent) =>
  onlineLinkOf(e) || absolutize(tag(e, "website")) || "https://lanapays.us/";

// Real cover only if it's a publicly reachable absolute URL. Relative
// /api/storage/... paths live inside the LanaPays backend and aren't
// publicly served, so we fall back to an on-brand image instead.
const coverOf = (e: NostrEvent): string => {
  const raw =
    tag(e, "cover") || tag(e, "image") || tag(e, "thumbnail") || tag(e, "picture") || "";
  if (!raw || !/^https?:\/\//i.test(raw)) return "";
  return raw;
};

// On-brand fallback covers from the site's own background photos.
const FALLBACK_IMAGES = [
  "/bg/lana-meadow.png",
  "/bg/lana-cottage.png",
  "/bg/lana-council.png",
  "/bg/lana-sky.png",
  "/bg/lana-meditation.png",
  "/bg/lana-mountain.png",
  "/bg/mandala-sunset.png",
];
const fallbackFor = (seed: string): string => {
  let sum = 0;
  for (let i = 0; i < seed.length; i++) sum += seed.charCodeAt(i);
  return FALLBACK_IMAGES[sum % FALLBACK_IMAGES.length];
};

const summaryOf = (e: NostrEvent): string =>
  (tag(e, "summary") || e.content || "").replace(/^"|"$/g, "").trim();

function normalize(events: NostrEvent[], lang: string): NormalizedEvent[] {
  const byKey = new Map<string, NostrEvent>();
  for (const e of events) {
    if (!e || e.kind !== 36677) continue;
    const status = (tag(e, "status") || "active").toLowerCase();
    if (status !== "active") continue;
    const d = tag(e, "d") || e.id;
    const key = `${e.kind}:${e.pubkey}:${d}`;
    const existing = byKey.get(key);
    if (!existing || (e.created_at || 0) > (existing.created_at || 0)) byKey.set(key, e);
  }

  const all = Array.from(byKey.values());
  const inLang = all.filter((e) => (tag(e, "language") || "").toLowerCase() === lang);
  // Prefer events in the current UI language; fall back to all active events
  // so the section is never needlessly empty for the other language.
  const pool = inLang.length ? inLang : all;

  return pool
    .map((event) => ({ event, occurrence: nextOccurrence(event) }))
    .filter((x): x is NormalizedEvent => !!x.occurrence)
    .sort((a, b) => a.occurrence.start.getTime() - b.occurrence.start.getTime())
    .slice(0, 6);
}

export function UpcomingEvents() {
  const { lang } = useLang();
  const locale = lang === "sl" ? "sl-SI" : "en-GB";
  const [events, setEvents] = useState<NormalizedEvent[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data.events) ? (data.events as NostrEvent[]) : [];
        setEvents(normalize(list, lang));
      })
      .catch(() => alive && setEvents([]));
    return () => {
      alive = false;
    };
  }, [lang]);

  const month = (d: Date) =>
    d.toLocaleDateString(locale, { month: "short" }).replace(".", "").toUpperCase();
  const weekday = (d: Date) => d.toLocaleDateString(locale, { weekday: "long" });
  const hour = (d: Date) => d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <section className="space-y-4">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-lana-ink flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5 text-lana-purple" />
          {t("ev_title", lang)}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t("ev_sub", lang)}</p>
      </div>

      {events === null ? (
        <div className="glass-card p-8 flex flex-col items-center gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-lana-purple" />
          <p className="text-sm text-muted-foreground">{t("ev_loading", lang)}</p>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-muted-foreground">{t("ev_empty", lang)}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {events.map(({ event, occurrence }) => {
            const { start, end } = occurrence;
            const time =
              end && end > start ? `${hour(start)} – ${hour(end)}` : hour(start);
            const title = tag(event, "title") || "Lana";
            const online = onlineLinkOf(event);
            const fallback = fallbackFor(tag(event, "d") || event.id || title);
            const cover = coverOf(event) || fallback;
            const summary = summaryOf(event);
            const long = summary.length > 200;
            const isOpen = expanded[event.id];
            const loc = tag(event, "location");

            return (
              <article
                key={event.id}
                className="glass-card overflow-hidden flex flex-col hover:scale-[1.01] transition-transform"
              >
                <div className="relative h-36 bg-lana-lavender">
                  <img
                    src={cover}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(ev) => {
                      const img = ev.currentTarget as HTMLImageElement;
                      if (img.src !== window.location.origin + fallback) img.src = fallback;
                    }}
                  />
                  <time className="absolute bottom-2 left-2 bg-white/90 backdrop-blur rounded-xl px-2.5 py-1 text-center shadow">
                    <span className="block text-lg font-bold leading-none text-lana-ink">
                      {start.getDate()}
                    </span>
                    <span className="block text-[10px] font-semibold text-lana-purple tracking-wide">
                      {month(start)}
                    </span>
                  </time>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <p className="text-[11px] uppercase tracking-wide text-lana-purple/80 font-semibold">
                    {weekday(start)} · {time}
                  </p>
                  <h3 className="font-semibold text-lana-ink leading-snug">{title}</h3>

                  {summary && (
                    <div className="text-xs text-muted-foreground">
                      <p className={long && !isOpen ? "line-clamp-3" : ""}>{summary}</p>
                      {long && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpanded((p) => ({ ...p, [event.id]: !p[event.id] }))
                          }
                          className="mt-0.5 text-lana-purple font-semibold hover:underline"
                        >
                          {isOpen ? t("ev_less", lang) : t("ev_more", lang)}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
                    {online ? (
                      <>
                        <Globe className="w-3.5 h-3.5 text-lana-purple shrink-0" />
                        <span>{t("ev_online", lang)}</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-lana-purple shrink-0" />
                        <span className="truncate">{loc || t("ev_location", lang)}</span>
                      </>
                    )}
                  </div>

                  {online && (
                    <a
                      href={linkOf(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-lana-purple text-white px-4 py-2 text-xs font-semibold hover:bg-lana-purple/90 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {t("ev_join", lang)}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
