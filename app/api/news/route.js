import { NextResponse } from "next/server";
import { sanitizeQuery } from "@/lib/searchUtils";
import { countryMeta } from "@/lib/countries";
import { getEditorialFallback } from "@/lib/newsImages";

// ─── Strategy ────────────────────────────────────────────────────────────────
// PRIMARY:   Google News RSS  — no API key, works in production, completely free
// SECONDARY: NewsAPI          — only works on localhost (free tier), kept as bonus
// Both return the same article shape so the frontend needs zero changes.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Google News RSS helpers ──────────────────────────────────────────────────

// Country code → Google News geo-topic query and hl/gl/ceid params
const COUNTRY_GNEWS = {
  pk: { hl: "en-PK", gl: "PK", ceid: "PK:en", keyword: "Pakistan" },
  us: { hl: "en-US", gl: "US", ceid: "US:en", keyword: null },
  gb: { hl: "en-GB", gl: "GB", ceid: "GB:en", keyword: null },
  in: { hl: "en-IN", gl: "IN", ceid: "IN:en", keyword: null },
  au: { hl: "en-AU", gl: "AU", ceid: "AU:en", keyword: null },
  ca: { hl: "en-CA", gl: "CA", ceid: "CA:en", keyword: null },
  global: { hl: "en-US", gl: "US", ceid: "US:en", keyword: null },
};

const CATEGORY_GNEWS_TOPIC = {
  general: "headlines",
  technology: "technology",
  business: "business",
  sports: "sports",
  entertainment: "entertainment",
  health: "health",
  science: "science",
};

// Build Google News RSS URL
function buildGoogleNewsUrl({ category, country, query }) {
  const locale = COUNTRY_GNEWS[country] || COUNTRY_GNEWS["global"];
  const { hl, gl, ceid } = locale;

  if (query && query.trim()) {
    // Search feed
    const q = encodeURIComponent(query.trim());
    return `https://news.google.com/rss/search?q=${q}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  }

  // For Pakistan specifically, use search to get Pakistan-specific news
  if (country === "pk" && category === "general") {
    const q = encodeURIComponent("Pakistan news");
    return `https://news.google.com/rss/search?q=${q}&hl=${hl}&gl=${gl}&ceid=${ceid}`;
  }

  // Category topic feeds
  const topic = CATEGORY_GNEWS_TOPIC[category] || "headlines";
  if (topic === "headlines") {
    return `https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`;
  }

  // Google News uses topic tokens for categories
  const TOPIC_TOKENS = {
    technology: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB",
    business: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB",
    sports: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRGQ2YVhRU0FtVnVHZ0pWVXlnQVAB",
    entertainment: "CAAqJggKIiBDQkFTRWdvSUwyMHZNREpxYW5RU0FtVnVHZ0pWVXlnQVAB",
    health: "CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ",
    science: "CAAqJggKIiBDQkFTRWdvSUwyMHZNRFp0Y1RjU0FtVnVHZ0pWVXlnQVAB",
  };

  const token = TOPIC_TOKENS[topic];
  if (token) {
    return `https://news.google.com/rss/topics/${token}?hl=${hl}&gl=${gl}&ceid=${ceid}`;
  }

  return `https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`;
}

// Minimal XML parser — extracts <item> blocks from RSS without any dependency
function parseRssXml(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const getText = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([^<]*)<\\/${tag}>`));
      return m ? (m[1] || m[2] || "").trim() : "";
    };

    const title = getText("title")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    const link = getText("link") || getText("guid");
    const pubDate = getText("pubDate");
    const description = getText("description")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .trim();

    // Extract source from title — Google News appends " - Source Name"
    let source = "Google News";
    let cleanTitle = title;
    const srcMatch = title.match(/^([\s\S]+?)\s+-\s+([^-]+)$/);
    if (srcMatch) {
      cleanTitle = srcMatch[1].trim();
      source = srcMatch[2].trim();
    }

    // Try to get image from media:content or enclosure
    const imgMatch = block.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i);
    const image = imgMatch ? imgMatch[1] : null;

    let publishedAt = null;
    if (pubDate) {
      try {
        publishedAt = new Date(pubDate).toISOString();
      } catch {
        publishedAt = null;
      }
    }

    if (cleanTitle && link && !cleanTitle.includes("[Removed]")) {
      items.push({ title: cleanTitle, url: link, source, description, image, publishedAt });
    }
  }

  return items;
}

async function fetchGoogleNewsRSS({ category, country, query }) {
  const url = buildGoogleNewsUrl({ category, country, query });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;

    const xml = await res.text();
    if (!xml.includes("<item>")) return null;

    return parseRssXml(xml);
  } catch (err) {
    console.error("Google News RSS fetch failed:", err.message || err);
    return null;
  }
}

// ─── NewsAPI helpers (secondary, localhost only) ───────────────────────────────

const NEWSAPI_BASE = "https://newsapi.org/v2";

const PK_GENERAL_KEYWORD =
  'Pakistan OR Islamabad OR Karachi OR Lahore OR Peshawar OR Quetta OR Sindh OR "Pakistan Tehreek-e-Insaf" OR "Pakistan Muslim League" OR "Pakistan Peoples Party"';

const PK_DOMAINS =
  "dawn.com,tribune.com.pk,thenews.com.pk,geo.tv,arynews.tv,brecorder.com,nation.com.pk,dailytimes.com.pk,samaa.tv";

const GLOBAL_DOMAINS =
  "bbc.co.uk,cnn.com,reuters.com,apnews.com,theguardian.com,nytimes.com,skynews.com,independent.co.uk,cbsnews.com,aljazeera.com";

const INDIAN_DOMAINS_TO_EXCLUDE =
  "timesofindia.indiatimes.com,indiatimes.com,ndtv.com,hindustantimes.com,indianexpress.com,news18.com,indiatoday.in,livemint.com,thehindu.com,zeenews.india.com";

const CATEGORY_KEYWORDS = {
  general: null,
  technology: "technology OR tech OR software OR AI",
  business: "business OR economy OR markets OR finance",
  sports: "sports OR cricket OR football OR match OR tournament",
  entertainment: "entertainment OR celebrity OR movie OR music OR drama",
  health: "health OR medicine OR disease OR hospital",
  science: "science OR research OR space OR discovery",
};

function countryKeyword(country) {
  const meta = countryMeta(country);
  if (!meta) return null;
  return meta.demonym && meta.demonym !== meta.name
    ? `${meta.name} OR ${meta.demonym}`
    : meta.name;
}

function categoryKeyword(category, country) {
  if (category === "general" && country === "pk") return PK_GENERAL_KEYWORD;
  if (category === "general" && country === "global") return null;
  if (category === "general" && country !== "pk") {
    return countryKeyword(country) || CATEGORY_KEYWORDS.general;
  }
  const catKw = CATEGORY_KEYWORDS[category] ?? null;
  if (country === "global") return catKw;
  if (!catKw) return countryKeyword(country);
  if (country === "pk") return catKw;
  const cKw = countryKeyword(country);
  return cKw ? `(${catKw}) AND (${cKw})` : catKw;
}

async function fetchNewsAPIArticles({ category, country, query, page, apiKey }) {
  try {
    const params = new URLSearchParams();
    params.set("language", "en");
    params.set("sortBy", "publishedAt");
    params.set("pageSize", "30");
    params.set("page", page);

    if (query) {
      params.set("q", sanitizeQuery(query));
      const excludeDomains = country === "in" ? undefined : INDIAN_DOMAINS_TO_EXCLUDE;
      if (excludeDomains) params.set("excludeDomains", excludeDomains);
    } else {
      const domains = country === "pk" ? PK_DOMAINS : country === "global" ? GLOBAL_DOMAINS : undefined;
      const excludeDomains = country === "in" ? undefined : INDIAN_DOMAINS_TO_EXCLUDE;
      const keyword = categoryKeyword(category, country);
      if (domains) params.set("domains", domains);
      if (excludeDomains) params.set("excludeDomains", excludeDomains);
      if (keyword) params.set("q", keyword);
    }

    const res = await fetch(`${NEWSAPI_BASE}/everything?${params.toString()}`, {
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return (data.articles || []).filter((a) => a.title && a.title !== "[Removed]");
  } catch {
    return null;
  }
}

// ─── AI Curation (optional — Anthropic) ──────────────────────────────────────

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const CURATION_TIMEOUT_MS = 8000;
const MIN_CURATED_RESULTS = 4;

async function curateArticles(articles, { category, country, isSearch }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || articles.length === 0) return articles;

  const listing = articles
    .map((a, i) => {
      const daysOld = a.publishedAt
        ? Math.floor((Date.now() - new Date(a.publishedAt).getTime()) / 86400000)
        : null;
      return `${i}. [${a.source}, ${daysOld === null ? "unknown age" : `${daysOld}d old`}] ${a.title} — ${(a.description || "").slice(0, 140)}`;
    })
    .join("\n");

  const scope = isSearch
    ? "a search result feed"
    : country === "pk"
    ? `the "${category}" section of a Pakistani news app`
    : country === "global"
    ? `the "${category}" section of a global/international news app (BBC, CNN, Reuters, AP, Guardian, etc.)`
    : `the "${category}" section of a global news app, focused on ${countryMeta(country)?.name || "that country"}`;

  const prompt = `You are curating ${scope}. Below is a numbered list of candidate articles (source, age, title, snippet).

Pick the articles that are genuinely current, substantive, and on-topic for this section — drop stale syndicated filler, duplicate stories, and anything clearly off-topic for the section. ${
    country === "pk" && !isSearch
      ? "For a Pakistani section, prioritize articles actually about Pakistan over generic wire content merely republished by a Pakistani outlet."
      : ""
  }

Return ONLY a JSON array of the chosen indices, ordered from most to least important, nothing else. Keep at least ${Math.min(
    MIN_CURATED_RESULTS,
    articles.length
  )} articles unless truly nothing qualifies.

Articles:
${listing}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CURATION_TIMEOUT_MS);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return articles;

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    const match = text.match(/\[[\d,\s]*\]/);
    if (!match) return articles;

    const indices = JSON.parse(match[0]).filter(
      (i) => Number.isInteger(i) && i >= 0 && i < articles.length
    );

    if (indices.length < Math.min(MIN_CURATED_RESULTS, articles.length)) {
      return articles;
    }

    return indices.map((i) => articles[i]);
  } catch (err) {
    console.error("Article curation skipped:", err.message || err);
    return articles;
  }
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

const CACHE_TTL_MS = 90 * 1000;
const cache = new Map();

function getCached(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function setCached(key, value) {
  cache.set(key, { value, time: Date.now() });
}

// ─── Shape normalizer ─────────────────────────────────────────────────────────

function normalizeArticles(rawList, category) {
  return rawList
    .filter((a) => a.title && !a.title.includes("[Removed]"))
    .map((a, i) => ({
      id: `${a.url || i}-${i}`,
      title: a.title,
      description: a.description || null,
      content: a.content || null,
      url: a.url,
      image: a.image || a.urlToImage || getEditorialFallback(a.title, category, i),
      source: a.source?.name || a.source || "News",
      author: a.author || null,
      publishedAt: a.publishedAt || null,
      category,
    }));
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "general";
  const query    = searchParams.get("q") || null;
  const page     = searchParams.get("page") || "1";
  const country  = searchParams.get("country") || "pk";
  const isSearch = Boolean(query && query.trim().length > 0);

  const cacheKey = `${category}|${country}|${query}|${page}`;
  const cached = getCached(cacheKey);
  if (cached) return NextResponse.json(cached);

  // ── 1. Google News RSS (primary — works everywhere, no key needed) ──────────
  try {
    const rssQuery = isSearch ? query : null;
    const rssItems = await fetchGoogleNewsRSS({ category, country, query: rssQuery });

    if (rssItems && rssItems.length > 0) {
      let articles = normalizeArticles(rssItems, category);

      // Optional AI curation
      articles = await curateArticles(articles, { category, country, isSearch });

      const body = { articles, totalResults: articles.length, source: "google-news-rss" };
      setCached(cacheKey, body);
      return NextResponse.json(body);
    }
  } catch (err) {
    console.error("Google News RSS error:", err.message || err);
  }

  // ── 2. NewsAPI (secondary — works on localhost only with free key) ──────────
  const newsApiKey = process.env.NEWS_API_KEY;
  if (newsApiKey && newsApiKey !== "your_newsapi_org_key_here") {
    try {
      const rawArticles = await fetchNewsAPIArticles({
        category, country, query, page, apiKey: newsApiKey,
      });

      if (rawArticles && rawArticles.length > 0) {
        let articles = normalizeArticles(rawArticles, category);
        articles = await curateArticles(articles, { category, country, isSearch });

        const body = { articles, totalResults: articles.length, source: "newsapi" };
        setCached(cacheKey, body);
        return NextResponse.json(body);
      }
    } catch (err) {
      console.error("NewsAPI error:", err.message || err);
    }
  }

  // ── 3. Nothing worked — return empty gracefully (no 500 error) ──────────────
  const body = { articles: [], totalResults: 0, source: "none" };
  return NextResponse.json(body);
}