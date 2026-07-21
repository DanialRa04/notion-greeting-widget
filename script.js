const params = new URLSearchParams(window.location.search);
const baseConfig = window.GREETING_CONFIG || {};

const config = {
  name: (params.get("name") || baseConfig.NAME || "there").trim(),
  timeZone: params.get("tz") || baseConfig.TIME_ZONE || "auto",
  locale: params.get("locale") || baseConfig.LOCALE || "en-US",
  quoteApi: baseConfig.QUOTE_API || "https://dummyjson.com/quotes/random"
};

const greetingElement = document.getElementById("greeting");
const dateElement = document.getElementById("date");
const quoteElement = document.getElementById("quote");

const fallbackQuotes = [
  "Build a life you don’t need to escape from.",
  "Small steps, repeated daily, create remarkable change.",
  "Focus on the direction, not the speed.",
  "Discipline today creates freedom tomorrow.",
  "What you do consistently matters more than what you do occasionally.",
  "Make today useful, not merely busy.",
  "A calm mind can build extraordinary things.",
  "Progress grows where attention goes.",
  "Give your best energy to what matters most.",
  "The life you want is built through ordinary days."
];

function resolvedTimeZone() {
  if (config.timeZone && config.timeZone !== "auto") {
    return config.timeZone;
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getHourInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false
  }).formatToParts(date);

  const hourPart = parts.find(part => part.type === "hour");
  const hour = Number(hourPart?.value ?? date.getHours());

  return hour === 24 ? 0 : hour;
}

function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 14) return "Good noon";
  if (hour >= 14 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

function renderDateAndGreeting() {
  const now = new Date();
  const timeZone = resolvedTimeZone();
  const hour = getHourInTimeZone(now, timeZone);

  greetingElement.textContent = `${greetingForHour(hour)}, ${config.name}.`;

  dateElement.textContent = new Intl.DateTimeFormat(config.locale, {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(now);
}

function localDateKey() {
  const timeZone = resolvedTimeZone();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function deterministicFallbackQuote(dateKey) {
  let hash = 0;

  for (const character of dateKey) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return fallbackQuotes[hash % fallbackQuotes.length];
}

function setQuote(text) {
  const clean = String(text || "").trim().replace(/^["“]|["”]$/g, "");
  quoteElement.textContent = `“${clean}”`;
}

async function loadDailyQuote() {
  const dateKey = localDateKey();
  const storageKey = "danialOS.dailyGreeting.quote.v1";

  try {
    const cached = JSON.parse(localStorage.getItem(storageKey));

    if (cached?.date === dateKey && cached?.quote) {
      setQuote(cached.quote);
      return;
    }
  } catch {
    localStorage.removeItem(storageKey);
  }

  try {
    const response = await fetch(config.quoteApi, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Quote API returned ${response.status}`);
    }

    const data = await response.json();
    const quote = data.quote || data.content || data.q;

    if (!quote) {
      throw new Error("Quote API response did not contain a quote");
    }

    localStorage.setItem(storageKey, JSON.stringify({
      date: dateKey,
      quote
    }));

    setQuote(quote);
  } catch (error) {
    console.warn("Unable to load online quote:", error);
    setQuote(deterministicFallbackQuote(dateKey));
  }
}

function scheduleMidnightRefresh() {
  const now = new Date();
  const nextCheck = new Date(now.getTime() + 60 * 1000);
  nextCheck.setSeconds(2, 0);

  window.setTimeout(() => {
    const previousDate = dateElement.dataset.dateKey;
    const currentDate = localDateKey();

    renderDateAndGreeting();

    if (previousDate !== currentDate) {
      dateElement.dataset.dateKey = currentDate;
      loadDailyQuote();
    }

    scheduleMidnightRefresh();
  }, nextCheck.getTime() - now.getTime());
}

renderDateAndGreeting();
dateElement.dataset.dateKey = localDateKey();
loadDailyQuote();
scheduleMidnightRefresh();

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    const previousDate = dateElement.dataset.dateKey;
    const currentDate = localDateKey();

    renderDateAndGreeting();

    if (previousDate !== currentDate) {
      dateElement.dataset.dateKey = currentDate;
      loadDailyQuote();
    }
  }
});
