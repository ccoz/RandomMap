import { randomInt, randomUUID } from "node:crypto";
import { allCountries } from "country-region-data";

export const GEO_COUNTRIES = allCountries
  .map(([name, code, regions]) => ({
    name,
    code,
    regions: regions.map(([regionName, regionCode]) => ({
      name: regionName,
      code: regionCode || ""
    }))
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const GEO_COUNTRY_BY_CODE = new Map(GEO_COUNTRIES.map((country) => [country.code, country]));

const COUNTRY_META = {
  US: { name: "United States", phone: "+1 555" },
  CA: { name: "Canada", phone: "+1 555" },
  GB: { name: "United Kingdom", phone: "+44 7700" },
  AU: { name: "Australia", phone: "+61 400" },
  NZ: { name: "New Zealand", phone: "+64 21" },
  DE: { name: "Germany", phone: "+49 151" },
  FR: { name: "France", phone: "+33 6" },
  IT: { name: "Italy", phone: "+39 320" },
  ES: { name: "Spain", phone: "+34 600" },
  NL: { name: "Netherlands", phone: "+31 6" },
  IE: { name: "Ireland", phone: "+353 85" },
  SE: { name: "Sweden", phone: "+46 70" },
  NO: { name: "Norway", phone: "+47 400" },
  DK: { name: "Denmark", phone: "+45 20" },
  FI: { name: "Finland", phone: "+358 40" },
  CH: { name: "Switzerland", phone: "+41 78" },
  AT: { name: "Austria", phone: "+43 660" },
  BE: { name: "Belgium", phone: "+32 470" },
  PT: { name: "Portugal", phone: "+351 910" },
  PL: { name: "Poland", phone: "+48 500" },
  CZ: { name: "Czechia", phone: "+420 601" },
  JP: { name: "Japan", phone: "+81 90" },
  KR: { name: "South Korea", phone: "+82 10" },
  SG: { name: "Singapore", phone: "+65 8" },
  HK: { name: "Hong Kong", phone: "+852 6" },
  TW: { name: "Taiwan", phone: "+886 912" },
  CN: { name: "China", phone: "+86 130" },
  IN: { name: "India", phone: "+91 90000" },
  BR: { name: "Brazil", phone: "+55 11 9" },
  MX: { name: "Mexico", phone: "+52 55" },
  AE: { name: "United Arab Emirates", phone: "+971 50" }
};

const PLACE_CATEGORIES = {
  mixed: ["hotel", "coworking space", "apartment building", "business center", "serviced apartment"],
  hotel: ["hotel", "serviced apartment", "boutique hotel"],
  office: ["coworking space", "business center", "office building"],
  residential: ["apartment building", "condominium", "residential building", "serviced apartment"]
};

const STRIPE_TEST_CARDS = [
  { brand: "Visa", number: "4242 4242 4242 4242", cvcLength: 3, note: "Successful payment" },
  { brand: "Visa Debit", number: "4000 0566 5566 5556", cvcLength: 3, note: "Successful debit card payment" },
  { brand: "Mastercard", number: "5555 5555 5555 4444", cvcLength: 3, note: "Successful payment" },
  { brand: "American Express", number: "3782 822463 10005", cvcLength: 4, note: "Successful payment" },
  { brand: "Discover", number: "6011 1111 1111 1117", cvcLength: 3, note: "Successful payment" }
];

const FIRST_NAMES = [
  "Alex", "Maya", "Noah", "Iris", "Leo", "Nina", "Owen", "Sofia",
  "Milo", "Clara", "Ravi", "Elena", "Theo", "Lena", "Jonas", "Ava"
];

const LAST_NAMES = [
  "Stone", "Kim", "Rivera", "Novak", "Carter", "Ito", "Patel", "Moreau",
  "Silva", "Meyer", "Chen", "Lopez", "Khan", "Rossi", "Nguyen", "Hart"
];

const DEMO_PLACES = [
  {
    id: "demo-us-sf-ferry-building",
    displayName: { text: "Ferry Building Marketplace" },
    formattedAddress: "1 Ferry Building, San Francisco, CA 94111, USA",
    location: { latitude: 37.7954905, longitude: -122.3936535 },
    googleMapsUri: "https://maps.google.com/?q=Ferry+Building+Marketplace+San+Francisco",
    addressComponents: [
      { longText: "1", shortText: "1", types: ["street_number"] },
      { longText: "Ferry Building", shortText: "Ferry Building", types: ["route"] },
      { longText: "San Francisco", shortText: "SF", types: ["locality"] },
      { longText: "California", shortText: "CA", types: ["administrative_area_level_1"] },
      { longText: "94111", shortText: "94111", types: ["postal_code"] },
      { longText: "United States", shortText: "US", types: ["country"] }
    ]
  },
  {
    id: "demo-gb-london-southbank",
    displayName: { text: "Southbank Centre" },
    formattedAddress: "Belvedere Rd, London SE1 8XX, United Kingdom",
    location: { latitude: 51.5058704, longitude: -0.1168896 },
    googleMapsUri: "https://maps.google.com/?q=Southbank+Centre+London",
    addressComponents: [
      { longText: "Belvedere Road", shortText: "Belvedere Rd", types: ["route"] },
      { longText: "London", shortText: "London", types: ["postal_town"] },
      { longText: "England", shortText: "England", types: ["administrative_area_level_1"] },
      { longText: "SE1 8XX", shortText: "SE1 8XX", types: ["postal_code"] },
      { longText: "United Kingdom", shortText: "GB", types: ["country"] }
    ]
  },
  {
    id: "demo-jp-tokyo-station",
    displayName: { text: "Tokyo Station" },
    formattedAddress: "1 Chome Marunouchi, Chiyoda City, Tokyo 100-0005, Japan",
    location: { latitude: 35.6812362, longitude: 139.7671248 },
    googleMapsUri: "https://maps.google.com/?q=Tokyo+Station",
    addressComponents: [
      { longText: "1 Chome", shortText: "1 Chome", types: ["sublocality_level_3"] },
      { longText: "Marunouchi", shortText: "Marunouchi", types: ["sublocality_level_2"] },
      { longText: "Chiyoda City", shortText: "Chiyoda City", types: ["locality"] },
      { longText: "Tokyo", shortText: "Tokyo", types: ["administrative_area_level_1"] },
      { longText: "100-0005", shortText: "100-0005", types: ["postal_code"] },
      { longText: "Japan", shortText: "JP", types: ["country"] }
    ]
  }
];

export function createHealthPayload() {
  return {
    ok: true,
    googleMapsKeySource: "browser-only",
    mode: "browser-key-required"
  };
}

export function createGeoPayload() {
  return {
    defaultCountry: "US",
    countries: GEO_COUNTRIES
  };
}

export async function buildBillingProfile(body) {
  const countryCode = normalizeCountryCode(body?.countryCode);
  const country = getCountryProfile(countryCode, body?.countryName);
  const region = sanitizeText(body?.region || "");
  const category = PLACE_CATEGORIES[body?.category] ? body.category : "mixed";
  const googleMapsApiKey = sanitizeApiKey(body?.googleMapsApiKey);

  const source = googleMapsApiKey
    ? await findGooglePlace({ countryCode, countryName: country.name, region, category, googleMapsApiKey })
    : pickDemoPlace(countryCode);

  const billingAddress = toStripeAddress(source.place, countryCode);
  const profile = makeStripeTestProfile({
    countryCode,
    countryName: country.name,
    phonePrefix: country.phone,
    address: billingAddress
  });

  return {
    id: randomUUID(),
    generatedAt: new Date().toISOString(),
    mode: googleMapsApiKey ? "google-maps" : "demo",
    googleMapsKeySource: googleMapsApiKey ? "browser" : "none",
    sourceWarning: googleMapsApiKey
      ? null
      : "No Google Maps API key was provided. This response uses bundled sample places; enter and save a key in the page to use live Google Maps data.",
    stripeMode: "test",
    card: profile.card,
    customer: profile.customer,
    billingAddress,
    place: {
      id: source.place.id || source.place.name || null,
      name: source.place.displayName?.text || source.place.displayName || "Google Maps place",
      formattedAddress: source.place.formattedAddress || billingAddress.line1,
      location: source.place.location
        ? {
            lat: Number(source.place.location.latitude),
            lng: Number(source.place.location.longitude)
          }
        : null,
      googleMapsUri: source.place.googleMapsUri || null,
      query: source.query
    }
  };
}

async function findGooglePlace({ countryCode, countryName, region, category, googleMapsApiKey }) {
  const categoryQuery = pick(PLACE_CATEGORIES[category]);
  const textQuery = `${categoryQuery} in ${region ? `${region}, ` : ""}${countryName}`;

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleMapsApiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.addressComponents",
        "places.googleMapsUri",
        "places.types"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery,
      regionCode: countryCode,
      languageCode: "en",
      pageSize: 12
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    const error = new Error(`Google Places API returned ${response.status}: ${detail}`);
    error.statusCode = 502;
    error.publicMessage = "Google Maps place lookup failed. Check your API key, billing, and Places API access.";
    throw error;
  }

  const data = await response.json();
  const places = Array.isArray(data.places) ? data.places : [];
  const usablePlaces = places.filter((place) => {
    const address = toStripeAddress(place, countryCode);
    return address.line1 && address.country;
  });

  if (!usablePlaces.length) {
    const error = new Error(`No usable places for query: ${textQuery}`);
    error.statusCode = 404;
    error.publicMessage = "No Google Maps place with enough address data was found for that country or region.";
    throw error;
  }

  return { place: pick(usablePlaces), query: textQuery };
}

function toStripeAddress(place, fallbackCountry) {
  const components = Array.isArray(place.addressComponents) ? place.addressComponents : [];
  const byType = (type) => components.find((component) => component.types?.includes(type));
  const text = (component, key = "longText") => component?.[key] || component?.longText || component?.shortText || "";

  const streetNumber = text(byType("street_number"));
  const route = text(byType("route"));
  const premise = text(byType("premise")) || text(byType("point_of_interest"));
  const sublocality = text(byType("sublocality_level_1")) || text(byType("sublocality"));
  const city =
    text(byType("locality")) ||
    text(byType("postal_town")) ||
    text(byType("administrative_area_level_2")) ||
    text(byType("administrative_area_level_3"));
  const state = text(byType("administrative_area_level_1"), "shortText");
  const postalCode = [text(byType("postal_code")), text(byType("postal_code_suffix"))].filter(Boolean).join("-");
  const country = text(byType("country"), "shortText") || fallbackCountry;
  const fallbackLine = place.formattedAddress?.split(",")?.[0]?.trim() || "";

  return {
    line1: [streetNumber, route].filter(Boolean).join(" ") || premise || fallbackLine,
    line2: sublocality && sublocality !== city ? sublocality : "",
    city,
    state,
    postal_code: postalCode,
    country
  };
}

function makeStripeTestProfile({ countryCode, countryName, phonePrefix, address }) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const card = pick(STRIPE_TEST_CARDS);
  const expiry = futureExpiry();

  return {
    customer: {
      name,
      email: `${firstName}.${lastName}.${randomInt(100, 999)}@example.test`.toLowerCase(),
      phone: `${phonePrefix} ${randomInt(1000, 9999)}`,
      country: countryName,
      metadata: {
        countryCode,
        purpose: "Stripe test billing profile"
      }
    },
    card: {
      brand: card.brand,
      number: card.number,
      exp_month: expiry.month,
      exp_year: expiry.year,
      cvc: randomNumeric(card.cvcLength),
      billing_name: name,
      test_note: card.note,
      usage: "Stripe test mode only"
    },
    address
  };
}

function futureExpiry() {
  const now = new Date();
  const month = randomInt(1, 13);
  const year = now.getFullYear() + randomInt(2, 7);
  return {
    month: String(month).padStart(2, "0"),
    year: String(year)
  };
}

function pickDemoPlace(countryCode) {
  const exact = DEMO_PLACES.find((place) =>
    place.addressComponents?.some((component) => component.types?.includes("country") && component.shortText === countryCode)
  );
  return {
    place: exact || pick(DEMO_PLACES),
    query: "bundled demo place"
  };
}

function normalizeCountryCode(value) {
  const code = String(value || "US").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) ? code : "US";
}

function getCountryProfile(countryCode, fallbackName) {
  const geoCountry = GEO_COUNTRY_BY_CODE.get(countryCode);
  const metadata = COUNTRY_META[countryCode] || {};

  return {
    name: metadata.name || geoCountry?.name || fallbackName || countryCode,
    phone: metadata.phone || "+00 555"
  };
}

function sanitizeText(value) {
  return String(value || "")
    .replace(/[^\p{L}\p{N}\s.,'()-]/gu, "")
    .trim()
    .slice(0, 80);
}

function sanitizeApiKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .slice(0, 200);
}

function randomNumeric(length) {
  return Array.from({ length }, () => randomInt(0, 10)).join("");
}

function pick(items) {
  return items[randomInt(0, items.length)];
}
