/**
 * Search over the provider directory (/api/providers) on /kje-potrosim.
 *
 * Every word typed must appear somewhere in the provider's name, category, what it
 * does, town or country code. Case and Slovenian diacritics do not matter, so
 * "qiflow", "QIFLOW" and "čokolada"/"cokolada" all find what they should.
 */
export interface SearchableProvider {
  unitId: string;
  name: string;
  category: string;
  categoryDetail: string;
  city: string;
  country: string;
  website: string;
  image: string;
  portal: { host: string; url: string } | null;
}

export function normalizeForSearch(s: string): string {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const haystackOf = (p: SearchableProvider): string =>
  normalizeForSearch([p.name, p.category, p.categoryDetail, p.city, p.country].join(" "));

export function searchProviders<T extends SearchableProvider>(providers: T[], query: string): T[] {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return providers;
  const nameStarts: T[] = [];
  const rest: T[] = [];
  for (const p of providers) {
    const hay = haystackOf(p);
    if (!words.every((w) => hay.includes(w))) continue;
    // A name that starts with what was typed comes first; the list order is kept otherwise.
    (normalizeForSearch(p.name).startsWith(words[0]) ? nameStarts : rest).push(p);
  }
  return [...nameStarts, ...rest];
}

/** Where a hit takes you: its page on the portal that lists it, else its own website. */
export function linkOf(p: SearchableProvider): string {
  return p.portal?.url || p.website || "";
}
