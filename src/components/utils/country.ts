const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Codes Intl still names but no current country uses: withdrawn ones (East
 * Germany, Yugoslavia, the USSR…), reserved ones (UK) and groupings (EU, UN).
 * Several share a name with a live code, e.g. DD is "Tyskland" in Swedish.
 */
const NOT_COUNTRIES = new Set([
  "AN",
  "BU",
  "CS",
  "DD",
  "EU",
  "EZ",
  "FX",
  "NT",
  "QO",
  "SU",
  "TP",
  "UK",
  "UN",
  "XA",
  "XB",
  "YU",
  "ZR",
]);

const normalise = (name: string) =>
  name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const namesByLocale = new Map<string, Map<string, string>>();

/**
 * Country name → ISO 3166 alpha-2 code, for one display language. Built from
 * Intl's own country names by trying every two-letter code, so it needs no
 * data file; codes Intl doesn't know echo back unchanged and are skipped.
 */
const codesByName = (locale: string) => {
  let codes = namesByLocale.get(locale);

  if (!codes) {
    codes = new Map();
    const names = new Intl.DisplayNames([locale], { type: "region" });

    for (const first of LETTERS) {
      for (const second of LETTERS) {
        const code = first + second;

        if (NOT_COUNTRIES.has(code)) {
          continue;
        }

        const name = names.of(code);

        if (name && name !== code && !codes.has(normalise(name))) {
          codes.set(normalise(name), code);
        }
      }
    }

    namesByLocale.set(locale, codes);
  }

  return codes;
};

/**
 * A location's country as a short code, e.g. "SE". The CMS field is free
 * text, so it may already be a code or may be a name in English or the site's
 * language; anything unrecognised is returned as entered rather than dropped.
 */
export const toCountryCode = (country: string, locale = "en") => {
  const trimmed = country.trim();

  if (/^[a-z]{2,3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  const key = normalise(trimmed);

  return codesByName(locale).get(key) ?? codesByName("en").get(key) ?? trimmed;
};
