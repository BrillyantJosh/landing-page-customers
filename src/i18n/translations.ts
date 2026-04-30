export type Language = "sl" | "en" | "de" | "it";

export const LANGUAGE_LABELS: Record<Language, string> = {
  sl: "Slovenščina",
  en: "English",
  de: "Deutsch",
  it: "Italiano",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  sl: "🇸🇮",
  en: "🇬🇧",
  de: "🇩🇪",
  it: "🇮🇹",
};

type TranslationKeys = {
  brand: string;
  hero_title_pre: string;
  hero_title_highlight: string;
  hero_title_post: string;
  hero_subtitle: string;
  feature_safe_title: string;
  feature_safe_desc: string;
  feature_fast_title: string;
  feature_fast_desc: string;
  feature_simple_title: string;
  feature_simple_desc: string;
  scan_card_title: string;
  scan_card_subtitle: string;
  scan_ready: string;
  scan_active: string;
  scan_button: string;
  scan_or_paste: string;
  paste_placeholder: string;
  privacy_note: string;
  footer_tagline: string;
  back: string;
  rescan: string;
  loading: string;
  error_invalid: string;
  result_title: string;
  result_balance_label: string;
  result_fiat_label: string;
  result_rate_label: string;
  result_unconfirmed_label: string;
  result_unregistered_title: string;
  result_unregistered_desc: string;
  result_frozen_title: string;
  result_frozen_desc: string;
  result_active_title: string;
  result_active_desc: string;
  currency_label: string;
};

export const TRANSLATIONS: Record<Language, TranslationKeys> = {
  sl: {
    brand: "Lana",
    hero_title_pre: "Preveri ",
    hero_title_highlight: "stanje",
    hero_title_post: "\nna svojem računu",
    hero_subtitle: "Skeniraj svoj Lana WIF ključ\nin v trenutku preveri stanje.",
    feature_safe_title: "Varno",
    feature_safe_desc: "100% varno skeniranje",
    feature_fast_title: "Hitro",
    feature_fast_desc: "Takojšnji rezultati",
    feature_simple_title: "Preprosto",
    feature_simple_desc: "Skeniraj in preveri",
    scan_card_title: "Skeniraj Lana WIF ključ",
    scan_card_subtitle: "Pripravi svoj ključ in ga približaj območju skeniranja.",
    scan_ready: "Pripravljeno za skeniranje",
    scan_active: "Skeniram…",
    scan_button: "Skeniraj WIF ključ",
    scan_or_paste: "ali prilepi ročno",
    paste_placeholder: "Prilepi WIF ključ…",
    privacy_note: "Tvoje podatke obdelujemo varno in zasebno.\nNič ni shranjeno. Samo ti vidiš svoje stanje.",
    footer_tagline: "Lana. Preprosto. Varno. Tvoje.",
    back: "Nazaj",
    rescan: "Skeniraj znova",
    loading: "Preverjam stanje…",
    error_invalid: "Neveljaven WIF ključ. Poskusi znova.",
    result_title: "Stanje računa",
    result_balance_label: "Stanje LANA",
    result_fiat_label: "Vrednost",
    result_rate_label: "Tečaj",
    result_unconfirmed_label: "Nepotrjeno",
    result_unregistered_title: "Račun ni registriran",
    result_unregistered_desc: "Ta WIF ključ še ni v Lana sistemu.",
    result_frozen_title: "Račun zamrznjen",
    result_frozen_desc: "Račun je trenutno zamrznjen. Sredstva so vidna, vendar omejena za prenos.",
    result_active_title: "Aktivni račun",
    result_active_desc: "Tvoja sredstva so na voljo.",
    currency_label: "Valuta",
  },
  en: {
    brand: "Lana",
    hero_title_pre: "Check your ",
    hero_title_highlight: "balance",
    hero_title_post: "\nin one scan",
    hero_subtitle: "Scan your Lana WIF key\nand instantly see your balance.",
    feature_safe_title: "Safe",
    feature_safe_desc: "100% secure scanning",
    feature_fast_title: "Fast",
    feature_fast_desc: "Instant results",
    feature_simple_title: "Simple",
    feature_simple_desc: "Scan and check",
    scan_card_title: "Scan Lana WIF key",
    scan_card_subtitle: "Hold your key close to the scan area.",
    scan_ready: "Ready to scan",
    scan_active: "Scanning…",
    scan_button: "Scan WIF key",
    scan_or_paste: "or paste manually",
    paste_placeholder: "Paste WIF key…",
    privacy_note: "Your data is processed safely and privately.\nNothing is stored. Only you see your balance.",
    footer_tagline: "Lana. Simple. Safe. Yours.",
    back: "Back",
    rescan: "Scan again",
    loading: "Checking balance…",
    error_invalid: "Invalid WIF key. Try again.",
    result_title: "Account balance",
    result_balance_label: "LANA balance",
    result_fiat_label: "Value",
    result_rate_label: "Rate",
    result_unconfirmed_label: "Unconfirmed",
    result_unregistered_title: "Account not registered",
    result_unregistered_desc: "This WIF key is not in the Lana system yet.",
    result_frozen_title: "Account frozen",
    result_frozen_desc: "This account is frozen. Funds are visible but transfers are limited.",
    result_active_title: "Active account",
    result_active_desc: "Your funds are available.",
    currency_label: "Currency",
  },
  de: {
    brand: "Lana",
    hero_title_pre: "Prüfe dein ",
    hero_title_highlight: "Guthaben",
    hero_title_post: "\nim Handumdrehen",
    hero_subtitle: "Scanne deinen Lana WIF Schlüssel\nund sieh sofort dein Guthaben.",
    feature_safe_title: "Sicher",
    feature_safe_desc: "100% sicheres Scannen",
    feature_fast_title: "Schnell",
    feature_fast_desc: "Sofortige Ergebnisse",
    feature_simple_title: "Einfach",
    feature_simple_desc: "Scannen und prüfen",
    scan_card_title: "Lana WIF Schlüssel scannen",
    scan_card_subtitle: "Halte deinen Schlüssel an den Scanbereich.",
    scan_ready: "Bereit zum Scannen",
    scan_active: "Scanne…",
    scan_button: "WIF Schlüssel scannen",
    scan_or_paste: "oder manuell einfügen",
    paste_placeholder: "WIF Schlüssel einfügen…",
    privacy_note: "Deine Daten werden sicher und privat verarbeitet.\nNichts wird gespeichert. Nur du siehst dein Guthaben.",
    footer_tagline: "Lana. Einfach. Sicher. Deins.",
    back: "Zurück",
    rescan: "Erneut scannen",
    loading: "Guthaben wird geprüft…",
    error_invalid: "Ungültiger WIF Schlüssel. Bitte erneut versuchen.",
    result_title: "Kontostand",
    result_balance_label: "LANA Guthaben",
    result_fiat_label: "Wert",
    result_rate_label: "Kurs",
    result_unconfirmed_label: "Unbestätigt",
    result_unregistered_title: "Konto nicht registriert",
    result_unregistered_desc: "Dieser WIF Schlüssel ist noch nicht im Lana System.",
    result_frozen_title: "Konto eingefroren",
    result_frozen_desc: "Dieses Konto ist eingefroren. Guthaben ist sichtbar, Transfers eingeschränkt.",
    result_active_title: "Aktives Konto",
    result_active_desc: "Dein Guthaben ist verfügbar.",
    currency_label: "Währung",
  },
  it: {
    brand: "Lana",
    hero_title_pre: "Controlla il tuo ",
    hero_title_highlight: "saldo",
    hero_title_post: "\nin un attimo",
    hero_subtitle: "Scansiona la tua chiave WIF Lana\ne vedi subito il tuo saldo.",
    feature_safe_title: "Sicuro",
    feature_safe_desc: "Scansione 100% sicura",
    feature_fast_title: "Veloce",
    feature_fast_desc: "Risultati istantanei",
    feature_simple_title: "Semplice",
    feature_simple_desc: "Scansiona e controlla",
    scan_card_title: "Scansiona chiave WIF Lana",
    scan_card_subtitle: "Avvicina la tua chiave all'area di scansione.",
    scan_ready: "Pronto per la scansione",
    scan_active: "Scansione…",
    scan_button: "Scansiona chiave WIF",
    scan_or_paste: "o incolla manualmente",
    paste_placeholder: "Incolla chiave WIF…",
    privacy_note: "I tuoi dati sono trattati in modo sicuro e privato.\nNiente viene salvato. Solo tu vedi il tuo saldo.",
    footer_tagline: "Lana. Semplice. Sicura. Tua.",
    back: "Indietro",
    rescan: "Scansiona di nuovo",
    loading: "Controllo saldo…",
    error_invalid: "Chiave WIF non valida. Riprova.",
    result_title: "Saldo del conto",
    result_balance_label: "Saldo LANA",
    result_fiat_label: "Valore",
    result_rate_label: "Tasso",
    result_unconfirmed_label: "Non confermato",
    result_unregistered_title: "Conto non registrato",
    result_unregistered_desc: "Questa chiave WIF non è ancora nel sistema Lana.",
    result_frozen_title: "Conto congelato",
    result_frozen_desc: "Questo conto è congelato. I fondi sono visibili ma i trasferimenti sono limitati.",
    result_active_title: "Conto attivo",
    result_active_desc: "I tuoi fondi sono disponibili.",
    currency_label: "Valuta",
  },
};
