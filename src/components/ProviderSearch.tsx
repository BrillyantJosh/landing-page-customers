import { useEffect, useMemo, useState } from "react";
import { Search, ExternalLink, Loader2, MapPin, Store } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { linkOf, searchProviders, type SearchableProvider } from "@/lib/providerSearch";

// Portal host -> its name on this page (the same keys as the portal tiles).
const PORTAL_NAME_KEY: Record<string, string> = {
  "lanaeco.farm": "portal_pridelovalci_name",
  "lanaeco.shop": "portal_trgovine_name",
  "lana.restaurant": "portal_restavracije_name",
  "lanabeauty.care": "portal_lepota_name",
  "lana.furniture": "portal_pohistvo_name",
  "lana.fashion": "portal_moda_name",
  "lana.pet": "portal_zivali_name",
  "lanamarket.place": "portal_trznica_name",
  "lana.events": "portal_dogodki_name",
  "lana.construction": "portal_gradnja_name",
  "lana.kids": "portal_otroci_name",
  "lana.vacations": "portal_pocitnice_name",
};

/**
 * Find any open provider of the network by name, town or what it does — also the
 * ones whose category no portal lists (they were not findable from this page before).
 */
export function ProviderSearch() {
  const { lang } = useLang();
  const [providers, setProviders] = useState<SearchableProvider[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/providers")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const list = Array.isArray(data?.providers) ? (data.providers as SearchableProvider[]) : [];
        setProviders(list);
        setFailed(list.length === 0);
      })
      .catch(() => {
        if (!alive) return;
        setProviders([]);
        setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const hits = useMemo(() => (providers ? searchProviders(providers, query) : []), [providers, query]);
  const searching = query.trim().length > 0;
  const shown = searching || showAll ? hits : [];

  const portalName = (host: string) => {
    const key = PORTAL_NAME_KEY[host];
    return key ? t(key, lang) : host;
  };

  return (
    <section className="glass-card p-5 space-y-3">
      <label htmlFor="provider-search" className="block font-semibold text-lana-ink text-sm">
        {t("kp_search_title", lang)}
      </label>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-lana-purple/70" />
        <input
          id="provider-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("kp_search_placeholder", lang)}
          className="w-full rounded-2xl border border-border/70 bg-white/70 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lana-purple/40"
        />
      </div>

      {providers === null ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-lana-purple" />
          {t("kp_search_loading", lang)}
        </p>
      ) : failed ? (
        <p className="text-xs text-muted-foreground">{t("kp_search_error", lang)}</p>
      ) : (
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {searching
              ? `${t("kp_search_hits", lang)}: ${hits.length}`
              : `${t("kp_search_count", lang)}: ${providers.length}`}
          </span>
          {!searching && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-lana-purple font-semibold hover:underline"
            >
              {showAll ? t("kp_search_hide_all", lang) : t("kp_search_show_all", lang)}
            </button>
          )}
        </div>
      )}

      {searching && providers !== null && !failed && hits.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("kp_search_none", lang)}</p>
      )}

      {shown.length > 0 && (
        <ul className="divide-y divide-foreground/10 rounded-2xl bg-white/50 border border-border/50 overflow-hidden">
          {shown.map((p) => {
            const href = linkOf(p);
            const where = [p.city, p.country].filter(Boolean).join(", ");
            const what = [p.category, p.categoryDetail].filter(Boolean).join(" · ");
            const body = (
              <>
                <div className="relative w-9 h-9 rounded-xl bg-lana-lavender flex items-center justify-center shrink-0 overflow-hidden">
                  <Store className="w-4 h-4 text-lana-purple" />
                  {p.image && (
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(ev) => { ev.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                    <p className="font-semibold text-lana-ink text-sm leading-tight break-words min-w-0">{p.name}</p>
                    {p.monthlyLimitReached && (
                      <span className="shrink-0 rounded-full border border-border/70 bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {t("kp_search_limit", lang)}
                      </span>
                    )}
                  </div>
                  {what && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{what}</p>}
                  <p className="text-[11px] text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-1">
                    {where && (
                      <>
                        <MapPin className="w-3 h-3 text-lana-purple/70 shrink-0" />
                        <span>{where}</span>
                        <span aria-hidden>·</span>
                      </>
                    )}
                    <span>
                      {p.portal
                        ? portalName(p.portal.host)
                        : p.website
                          ? t("kp_search_website", lang)
                          : t("kp_search_no_portal", lang)}
                    </span>
                  </p>
                </div>
                {href && <ExternalLink className="w-4 h-4 text-lana-purple/50 group-hover:text-lana-purple transition shrink-0" />}
              </>
            );
            return (
              <li key={`${p.unitId}:${p.name}`}>
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/80 transition group"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
