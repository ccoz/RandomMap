const GOOGLE_MAPS_KEY_STORAGE_KEY = "randomMap.googleMapsApiKey";

const state = {
  geoCountries: [],
  lastPayload: null,
  loading: false
};

const nodes = {
  form: document.querySelector("#generator-form"),
  country: document.querySelector("#country"),
  region: document.querySelector("#region"),
  apiKey: document.querySelector("#google-maps-key"),
  saveApiKey: document.querySelector("#save-api-key"),
  clearApiKey: document.querySelector("#clear-api-key"),
  generate: document.querySelector("#generate"),
  status: document.querySelector("#source-status"),
  statusText: document.querySelector("#status-text"),
  empty: document.querySelector("#empty-state"),
  result: document.querySelector("#result"),
  error: document.querySelector("#error"),
  copyJson: document.querySelector("#copy-json"),
  resultTitle: document.querySelector("#result-title"),
  cardBrand: document.querySelector("#card-brand"),
  cardNumber: document.querySelector("#card-number"),
  cardExp: document.querySelector("#card-exp"),
  cardCvc: document.querySelector("#card-cvc"),
  stripeMode: document.querySelector("#stripe-mode"),
  customerCountry: document.querySelector("#customer-country"),
  customerName: document.querySelector("#customer-name"),
  customerEmail: document.querySelector("#customer-email"),
  customerPhone: document.querySelector("#customer-phone"),
  addressCountry: document.querySelector("#address-country"),
  addressLine1: document.querySelector("#address-line1"),
  addressLine2: document.querySelector("#address-line2"),
  addressCity: document.querySelector("#address-city"),
  addressState: document.querySelector("#address-state"),
  addressPostal: document.querySelector("#address-postal"),
  sourceMode: document.querySelector("#source-mode"),
  placeName: document.querySelector("#place-name"),
  placeAddress: document.querySelector("#place-address"),
  placeLat: document.querySelector("#place-lat"),
  placeLng: document.querySelector("#place-lng"),
  mapsLink: document.querySelector("#maps-link")
};

boot();

async function boot() {
  bindEvents();
  loadStoredApiKey();
  checkHealth();
  await loadGeoData();
}

function populateCountries() {
  const options = state.geoCountries.map((country) => new Option(`${country.name} (${country.code})`, country.code));
  nodes.country.replaceChildren(...options);

  const defaultCountry = state.geoCountries.some((country) => country.code === "US")
    ? "US"
    : state.geoCountries[0]?.code;

  nodes.country.value = defaultCountry;
  populateRegions(defaultCountry);
}

function bindEvents() {
  nodes.country.addEventListener("change", () => {
    populateRegions(nodes.country.value);
  });

  nodes.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await generateProfile();
  });

  nodes.saveApiKey.addEventListener("click", () => {
    saveApiKey();
    updateSourceStatus();
  });

  nodes.clearApiKey.addEventListener("click", () => {
    clearStoredApiKey();
    updateSourceStatus();
  });

  nodes.apiKey.addEventListener("input", updateSourceStatus);

  nodes.copyJson.addEventListener("click", async () => {
    if (!state.lastPayload) return;
    await navigator.clipboard.writeText(JSON.stringify(state.lastPayload, null, 2));
    const original = nodes.copyJson.textContent;
    nodes.copyJson.textContent = "已复制";
    window.setTimeout(() => {
      nodes.copyJson.textContent = original;
    }, 1200);
  });
}

async function checkHealth() {
  try {
    await getJson("/api/health");
    updateSourceStatus();
  } catch {
    nodes.status.classList.add("is-demo");
    nodes.statusText.textContent = "服务状态不可用";
  }
}

async function generateProfile() {
  if (!state.geoCountries.length) {
    showError("国家 / 地区数据尚未加载完成。");
    return;
  }

  setLoading(true);
  clearError();

  const selected = countryMeta(nodes.country.value);
  const selectedRegion = nodes.region.selectedOptions[0];
  const category = new FormData(nodes.form).get("category") || "mixed";

  try {
    const payload = await postJson("/api/generate", {
      countryCode: selected.code,
      countryName: selected.name,
      region: nodes.region.value,
      regionCode: selectedRegion?.dataset.code || "",
      googleMapsApiKey: currentApiKey(),
      category
    });
    renderProfile(payload);
  } catch (error) {
    showError(error.message || "生成失败，请稍后重试。");
  } finally {
    setLoading(false);
  }
}

function renderProfile(payload) {
  state.lastPayload = payload;
  const { card, customer, billingAddress, place } = payload;

  nodes.empty.classList.add("is-hidden");
  nodes.result.classList.remove("is-hidden");
  nodes.copyJson.disabled = false;
  nodes.resultTitle.textContent = customer.name;

  nodes.cardBrand.textContent = card.brand;
  nodes.cardNumber.textContent = card.number;
  nodes.cardExp.textContent = `${card.exp_month}/${card.exp_year}`;
  nodes.cardCvc.textContent = card.cvc;
  nodes.stripeMode.textContent = `${payload.stripeMode.toUpperCase()} only`;

  nodes.customerCountry.textContent = customer.country;
  nodes.customerName.textContent = customer.name;
  nodes.customerEmail.textContent = customer.email;
  nodes.customerPhone.textContent = customer.phone;

  nodes.addressCountry.textContent = billingAddress.country || "--";
  nodes.addressLine1.textContent = billingAddress.line1 || "--";
  nodes.addressLine2.textContent = billingAddress.line2 || "--";
  nodes.addressCity.textContent = billingAddress.city || "--";
  nodes.addressState.textContent = billingAddress.state || "--";
  nodes.addressPostal.textContent = billingAddress.postal_code || "--";

  nodes.sourceMode.textContent = payload.mode === "google-maps" ? "Live" : "Demo";
  nodes.placeName.textContent = place.name || "Google Maps place";
  nodes.placeAddress.textContent = place.formattedAddress || "";
  nodes.placeLat.textContent = place.location ? place.location.lat.toFixed(6) : "--";
  nodes.placeLng.textContent = place.location ? place.location.lng.toFixed(6) : "--";

  if (place.googleMapsUri) {
    nodes.mapsLink.href = place.googleMapsUri;
    nodes.mapsLink.removeAttribute("aria-disabled");
  } else {
    nodes.mapsLink.href = "#";
    nodes.mapsLink.setAttribute("aria-disabled", "true");
  }

  if (payload.sourceWarning) {
    showError(payload.sourceWarning);
  }
}

function countryMeta(code) {
  return state.geoCountries.find((country) => country.code === code) || state.geoCountries[0] || {
    code: "US",
    name: "United States",
    regions: []
  };
}

function populateRegions(countryCode) {
  const regions = regionOptions(countryCode);
  const options = regions.length
    ? regions.map((region) => {
        const label = region.code ? `${region.name} (${region.code})` : region.name;
        const option = new Option(label, region.name);
        option.dataset.code = region.code || "";
        return option;
      })
    : [new Option("不限定行政区", "")];

  nodes.region.replaceChildren(...options);
  nodes.region.value = options[0].value;
}

function regionOptions(countryCode) {
  return countryMeta(countryCode).regions || [];
}

async function loadGeoData() {
  nodes.generate.disabled = true;
  nodes.generate.querySelector("span").textContent = "正在加载地区...";

  try {
    const geo = await loadGeoPayload();
    state.geoCountries = Array.isArray(geo.countries) ? geo.countries : [];
    if (!state.geoCountries.length) throw new Error("Empty geo payload");
    populateCountries();
    setLoading(false);
  } catch {
    showError("国家 / 地区数据加载失败，请刷新页面。");
    nodes.generate.querySelector("span").textContent = "地区数据不可用";
  }
}

async function loadGeoPayload() {
  try {
    return await getJson("/api/geo");
  } catch {
    return getJson("/geo.json");
  }
}

function loadStoredApiKey() {
  const storedKey = readStoredApiKey();
  nodes.apiKey.value = storedKey;
}

function saveApiKey() {
  const apiKey = currentApiKey();
  if (!apiKey) {
    clearStoredApiKey();
    showError("Google Maps API Key 为空，已清除浏览器缓存。");
    return;
  }

  try {
    localStorage.setItem(GOOGLE_MAPS_KEY_STORAGE_KEY, apiKey);
    nodes.apiKey.value = apiKey;
    showError("Google Maps API Key 已保存到此浏览器。");
  } catch {
    showError("浏览器缓存不可用，无法保存 API Key。");
  }
}

function clearStoredApiKey() {
  try {
    localStorage.removeItem(GOOGLE_MAPS_KEY_STORAGE_KEY);
  } catch {
    // localStorage may be blocked; clearing the input still gives this page a clean state.
  }

  nodes.apiKey.value = "";
  showError("已清除浏览器中的 Google Maps API Key。");
}

function readStoredApiKey() {
  try {
    return localStorage.getItem(GOOGLE_MAPS_KEY_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function currentApiKey() {
  return nodes.apiKey.value.trim().replace(/\s+/g, "");
}

function updateSourceStatus() {
  const hasBrowserKey = Boolean(currentApiKey());

  nodes.status.classList.toggle("is-live", hasBrowserKey);
  nodes.status.classList.toggle("is-demo", !hasBrowserKey);

  if (hasBrowserKey) {
    nodes.statusText.textContent = "Google Maps 实时数据源";
    return;
  }

  nodes.statusText.textContent = "请输入并保存 Google Maps API Key";
}

async function getJson(url) {
  const response = await fetch(url);
  return parseJsonResponse(response);
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = [payload.error, payload.detail].filter(Boolean).join("：");
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return payload;
}

function setLoading(loading) {
  state.loading = loading;
  nodes.generate.disabled = loading;
  nodes.generate.querySelector("span").textContent = loading ? "正在生成..." : "生成账单资料";
}

function clearError() {
  nodes.error.textContent = "";
}

function showError(message) {
  nodes.error.textContent = message;
}
