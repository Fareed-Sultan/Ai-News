import { NextResponse } from "next/server";
import { sanitizeQuery } from "@/lib/searchUtils";
import { parseTimeWindow, extractTimeSlot, extractDateInfo } from "@/lib/timeParse";
import { countryMeta } from "@/lib/countries";

// The AI Chatbot intelligence route:
//  1. Detects language (Roman Urdu, Urdu script, English, etc.) and responds in that SAME language
//  2. Extracts exact requested bulletin times (e.g. "9 PM", "1 PM", "subah 9 baje")
//  3. Extracts exact requested dates (e.g. "yesterday", "kal", "18-8-2026", "18 August")
//  4. Queries MULTIPLE leading TV news channels in parallel (ARY News, Geo News, Dunya News, Hum News, Samaa TV, CNN, BBC, etc.)
//  5. Queries Live Grounded News Articles via NewsAPI
//  6. Synthesizes real-time intelligence via Gemini or High-Precision Server-Side Neural News Synthesizer
//  7. Returns verified video feeds, articles, and authoritative briefing

const NEWS_BASE_URL = "https://newsapi.org/v2/everything";
const TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines";
const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-2.0-flash-lite",
  "gemini-1.5-pro",
];
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ─── Country TV Channel Profiles (Multi-Channel Lists) ─────────────────────────

const COUNTRY_PROFILES = {
  pk: {
    name: "Pakistan",
    channelsList: ["ARY News", "Geo News", "Dunya News", "HUM News", "Samaa TV", "Express News"],
    channelNames: "ARY News, Geo News, Dunya News, Hum News, Samaa TV, Express News",
    regionCode: "PK",
    domains: "dawn.com,tribune.com.pk,thenews.com.pk,geo.tv,arynews.tv,brecorder.com,samaa.tv,dunyanews.tv",
    newsKeyword: "Pakistan OR Islamabad OR Karachi OR Lahore OR Shehbaz OR Imran Khan",
  },
  us: {
    name: "United States",
    channelsList: ["CNN", "Fox News", "ABC News", "NBC News", "CBS News", "MSNBC"],
    channelNames: "CNN, Fox News, ABC News, NBC News, CBS News, MSNBC",
    regionCode: "US",
    domains: "cnn.com,foxnews.com,abcnews.go.com,cbsnews.com,nbcnews.com,nytimes.com,washingtonpost.com",
    newsKeyword: "United States OR White House OR Congress OR Biden OR Trump",
  },
  gb: {
    name: "United Kingdom",
    channelsList: ["BBC News", "Sky News", "ITV News", "Channel 4 News"],
    channelNames: "BBC News, Sky News, ITV News, Channel 4 News",
    regionCode: "GB",
    domains: "bbc.com,theguardian.com,telegraph.co.uk,independent.co.uk,reuters.com",
    newsKeyword: "UK OR Britain OR London OR Parliament OR Prime Minister",
  },
  in: {
    name: "India",
    channelsList: ["NDTV", "India Today", "Republic World", "Times Now", "WION"],
    channelNames: "NDTV, India Today, Republic World, Times Now, WION",
    regionCode: "IN",
    domains: "ndtv.com,indiatoday.in,thehindu.com,indianexpress.com",
    newsKeyword: "India OR Delhi OR Mumbai OR Parliament OR Modi",
  },
  global: {
    name: "Global",
    channelsList: ["BBC News", "CNN", "Al Jazeera English", "Reuters", "Sky News", "DW News"],
    channelNames: "BBC News, CNN, Al Jazeera English, Reuters, Sky News, DW News",
    regionCode: "US",
    domains: "bbc.com,reuters.com,apnews.com,cnn.com,theguardian.com,aljazeera.com",
    newsKeyword: "World news OR breaking news OR international",
  },
};

const FETCH_TIMEOUT_MS = 9000;

// ─── Language Detector ────────────────────────────────────────────────────────

function detectLanguage(text) {
  if (!text) return "en";
  if (/[\u0600-\u06FF]/.test(text)) return "ur_script";

  const romanUrduWords = new Set([
    "subah", "subha", "shaam", "sham", "raat", "dopeher", "dopahar", "baje",
    "bajhay", "bajy", "bje", "bjay", "aaj", "kal", "parson", "parso", "taza", "khabar",
    "khabrain", "batao", "bataen", "bataiye", "kya", "kia", "kaise", "kese",
    "hai", "hain", "mein", "main", "ki", "ka", "ke", "ko", "ye", "yeh", "wo",
    "woh", "mujhe", "humko", "humein", "bhi", "karo", "karen", "chal", "rehi",
    "rahi", "raha", "rahe", "tha", "thi", "the", "sunao", "dekhao", "dikhao",
    "kuch", "kitne", "konsi", "kahan", "kyun", "q", "kyu", "wali", "wala",
    "wale", "dekh", "daikho", "bhejo", "aur", "or", "sirf", "sab", "ap", "aap", "tum"
  ]);

  const words = text.toLowerCase().split(/\s+/).map((w) => w.replace(/[^\w]/g, ""));
  const matchCount = words.filter((w) => romanUrduWords.has(w)).length;

  if (matchCount >= 1 || (words.length <= 4 && matchCount >= 1)) {
    return "roman_urdu";
  }
  return "en";
}

// ─── Scope & Profile Resolver ─────────────────────────────────────────────────

function resolveTargetProfile(message, countryCode = "pk") {
  const lower = (message || "").toLowerCase();

  if (
    lower.includes("times square") ||
    lower.includes("new york") ||
    lower.includes("usa") ||
    lower.includes("america") ||
    lower.includes("white house") ||
    lower.includes("trump") ||
    lower.includes("biden")
  ) {
    return COUNTRY_PROFILES.us;
  }
  if (
    lower.includes("pakistan") ||
    lower.includes("karachi") ||
    lower.includes("lahore") ||
    lower.includes("islamabad") ||
    lower.includes("imran") ||
    lower.includes("geo news") ||
    lower.includes("ary news") ||
    lower.includes("hum news") ||
    lower.includes("samaa") ||
    lower.includes("dunya")
  ) {
    return COUNTRY_PROFILES.pk;
  }
  if (lower.includes("london") || lower.includes("uk") || lower.includes("britain") || lower.includes("bbc")) {
    return COUNTRY_PROFILES.gb;
  }
  if (lower.includes("india") || lower.includes("delhi") || lower.includes("mumbai") || lower.includes("modi")) {
    return COUNTRY_PROFILES.in;
  }

  if (COUNTRY_PROFILES[countryCode]) {
    return COUNTRY_PROFILES[countryCode];
  }

  const meta = countryMeta(countryCode);
  if (meta) {
    return {
      name: meta.name,
      channelsList: [`${meta.name} News`, "BBC News", "CNN"],
      channelNames: `${meta.name} National TV & International News`,
      regionCode: countryCode.toUpperCase(),
      domains: "bbc.com,reuters.com,apnews.com,cnn.com",
      newsKeyword: `${meta.name} OR ${meta.demonym || meta.name}`,
    };
  }

  return COUNTRY_PROFILES.pk;
}

// ─── Greetings ────────────────────────────────────────────────────────────────

function checkGreeting(message, lang) {
  const clean = message.trim().toLowerCase().replace(/[^\w\s]/g, "");
  const GREETINGS = new Set([
    "hi", "hello", "hey", "hola", "hy", "hie", "heya", "yo",
    "aoa", "salam", "assalam", "assalamoalaikum", "assalamualaykum",
    "assalam o alaikum", "kaise ho", "kya hal hai", "kya haal hai",
    "kia hal hai", "how are you", "good morning", "good evening",
    "good afternoon", "good night", "greetings",
    "who are you", "tum kaun ho", "aap kaun ho", "help",
  ]);

  if (GREETINGS.has(clean) || clean.length <= 2) {
    let answer;
    if (lang === "ur_script") {
      answer = "وعلیکم السلام! میں پلس نیوز اسسٹنٹ ہوں۔ میں دنیا بھر کے لائیو ٹی وی نیوز چینلز اور وائر رپورٹس کو 24/7 مانیٹر کرتا ہوں۔ آپ مجھ سے کسی بھی وقت کے بلیٹن (مثلاً 9 بجے کی خبریں) یا کسی بھی موضوع کی لائیو اپڈیٹس پوچھ سکتے ہیں۔";
    } else if (lang === "roman_urdu") {
      answer = "Walaikum Assalam! Main Pulse AI News Assistant hoon. Main tamam top TV channels (ARY News, Geo News, Dunya, Samaa, Hum News) aur global wires ko 24/7 monitor karta hoon. Aap mujhse kisi bhi waqt ka bulletin (jaise 'subah 9 baje ki news' ya '9 PM headlines') ya kisi bhi topic ki taza khabrain pooch sakte hain.";
    } else {
      answer = "Hello! I am Pulse AI News Assistant — your real-time news intelligence companion. I monitor global wires and live TV news broadcasts 24/7 across major TV networks (ARY News, Geo News, Dunya, CNN, BBC, Sky News). Ask me about any breaking event, specific bulletin time (e.g. '9 PM news'), or country updates!";
    }
    return { isGreeting: true, answer };
  }
  return { isGreeting: false };
}

function makeController(ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return { controller, timeout };
}

// ─── Multi-Channel Parallel YouTube Video Fetcher ─────────────────────────────

async function fetchChannelVideos(channelName, timeSlot, query, dateInfo, regionCode, apiKey) {
  let q;
  const dateStr = dateInfo ? `${dateInfo.day} ${dateInfo.monthShort} ${dateInfo.year || ""}`.trim() : "";

  if (timeSlot && dateInfo) {
    q = `${channelName} ${timeSlot.slot} ${dateStr} headlines`;
  } else if (timeSlot) {
    q = `${channelName} ${timeSlot.slot} headlines`;
  } else if (dateInfo && query) {
    q = `${channelName} ${query} ${dateStr}`;
  } else if (dateInfo) {
    q = `${channelName} ${dateStr} headlines`;
  } else if (query) {
    q = `${channelName} ${query} news`;
  } else {
    q = `${channelName} headlines today`;
  }

  const params = new URLSearchParams({
    part: "snippet",
    q,
    type: "video",
    order: "date",
    maxResults: "5",
    videoCategoryId: "25", // Category 25 = News & Politics ONLY
    regionCode: regionCode || "PK",
    relevanceLanguage: "en",
    key: apiKey,
  });

  if (dateInfo?.publishedAfter) {
    params.set("publishedAfter", dateInfo.publishedAfter);
  }
  if (dateInfo?.publishedBefore) {
    params.set("publishedBefore", dateInfo.publishedBefore);
  }

  const { controller, timeout } = makeController(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return [];

    const data = await res.json();
    const items = parseYtItems(data.items || []);

    // If date-restricted returned 0 items, fallback to searching without strict publish window
    if (items.length === 0 && dateInfo?.publishedAfter) {
      params.delete("publishedAfter");
      params.delete("publishedBefore");
      const { controller: c2, timeout: t2 } = makeController(FETCH_TIMEOUT_MS);
      try {
        const res2 = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`, {
          cache: "no-store",
          signal: c2.signal,
        });
        clearTimeout(t2);
        if (res2.ok) {
          const data2 = await res2.json();
          return parseYtItems(data2.items || []);
        }
      } catch {
        clearTimeout(t2);
      }
    }

    return items;
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchBroadcastVideos({ query, profile, timeSlot, dateInfo }) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const channels = profile.channelsList || ["ARY News", "Geo News", "Dunya News", "HUM News", "Samaa TV"];

  // Fetch channels in parallel to ensure diversity across all networks
  const channelResults = await Promise.all(
    channels.map((ch) => fetchChannelVideos(ch, timeSlot, query, dateInfo, profile.regionCode, apiKey))
  );

  // Interleave results so every TV channel is represented in the list
  const merged = [];
  const maxLen = Math.max(0, ...channelResults.map((r) => r.length));

  for (let i = 0; i < maxLen; i++) {
    for (const list of channelResults) {
      if (list[i] && merged.length < 16) {
        if (!merged.some((m) => m.id === list[i].id)) {
          merged.push(list[i]);
        }
      }
    }
  }

  if (merged.length === 0) return [];

  // Score videos: heavily reward exact date & exact time matches; penalize conflicting dates
  const scoreVideo = (v) => {
    let score = 0;
    const title = (v.title || "").toLowerCase();
    const pubDate = v.publishedAt || "";

    if (dateInfo) {
      const day = String(dateInfo.day);
      const mShort = (dateInfo.monthShort || "").toLowerCase();
      const mFull = (dateInfo.monthName || "").toLowerCase();
      const mNum = String(dateInfo.month + 1);
      const mNumPad = mNum.padStart(2, "0");

      const dateInTitle = new RegExp(
        `\\b(?:${day}(?:st|nd|rd|th)?\\s*(?:${mShort}|${mFull})|(?:${mShort}|${mFull})\\s*${day}(?:st|nd|rd|th)?|${day}[-/.]0?${mNum}|${day}[-/.]${mNumPad})\\b`,
        "i"
      ).test(title);

      const dateInPub = pubDate.startsWith(`${dateInfo.year}-${mNumPad}-${day.padStart(2, "0")}`);

      if (dateInTitle || dateInPub) {
        score += 50;
      }

      const wrongDayInTitle = new RegExp(
        `\\b(?!${day}\\b)\\d{1,2}(?:st|nd|rd|th)?\\s*(?:${mShort}|${mFull})\\b`,
        "i"
      ).test(title);

      if (wrongDayInTitle) {
        score -= 40;
      }
    }

    if (timeSlot) {
      const timeRegex = new RegExp(
        `\\b(?:${timeSlot.hour}\\s*(?:pm|am|baje|bajhay)|${timeSlot.slotAlt}|${timeSlot.hour}:00)\\b`,
        "i"
      );
      if (timeRegex.test(title)) {
        score += 30;
      }
    }

    return score;
  };

  const ranked = [...merged].sort((a, b) => scoreVideo(b) - scoreVideo(a));
  const validRanked = dateInfo ? ranked.filter((v) => scoreVideo(v) >= 0) : ranked;

  return (validRanked.length > 0 ? validRanked : ranked).slice(0, 10);
}

function parseYtItems(items) {
  return (items || [])
    .filter((v) => v.id?.videoId && v.snippet?.title)
    .map((v) => ({
      id: v.id.videoId,
      title: v.snippet.title.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      channel: v.snippet.channelTitle,
      thumbnail: v.snippet.thumbnails?.medium?.url || v.snippet.thumbnails?.default?.url,
      publishedAt: v.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${v.id.videoId}`,
    }));
}

// ─── Fetch Grounding Articles via NewsAPI ─────────────────────────────────────

async function fetchGroundingArticles({ query, profile, from, to }) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams();
  params.set("q", query || profile.newsKeyword);
  if (profile.domains) params.set("domains", profile.domains);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("language", "en");
  params.set("sortBy", "publishedAt");
  params.set("pageSize", "10");

  const { controller, timeout } = makeController(FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${NEWS_BASE_URL}?${params.toString()}`, {
      headers: { "X-Api-Key": apiKey },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const res2 = await fetch(`${TOP_HEADLINES_URL}?language=en&pageSize=10`, {
        headers: { "X-Api-Key": apiKey },
        cache: "no-store",
      });
      if (res2.ok) {
        const data2 = await res2.json();
        return (data2.articles || []).filter((a) => a.title && !a.title.includes("[Removed]"));
      }
      return [];
    }

    const data = await res.json();
    return (data.articles || []).filter((a) => a.title && !a.title.includes("[Removed]"));
  } catch (err) {
    clearTimeout(timeout);
    return [];
  }
}

// ─── Multi-Tier AI News Briefing Generator ────────────────────────────────────

async function askGemini({ question, profile, articles, videos, timeSlot, dateInfo, lang }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.startsWith("AIzaSy")) {
    const broadcastList = videos.length
      ? videos.slice(0, 8).map((v, i) => `${i + 1}. [${v.channel}] ${v.title}`).join("\n")
      : "(No direct live broadcast clips returned)";

    const articleList = articles.length
      ? articles.slice(0, 6).map((a, i) => `${i + 1}. [${a.source?.name || a.source}] ${a.title} - ${(a.description || "").slice(0, 100)}`).join("\n")
      : "";

    let langInstruction = "";
    if (lang === "roman_urdu") {
      langInstruction = "CRITICAL LANGUAGE RULE: The user asked in Roman Urdu. You MUST write your ENTIRE response in natural, fluent, spoken Roman Urdu (e.g. 'Pakistan ke mukhtalif TV channels ke mutabiq ahem khabrain yeh hain...'). Do NOT write in English!";
    } else if (lang === "ur_script") {
      langInstruction = "CRITICAL LANGUAGE RULE: The user asked in Urdu script. You MUST write your entire response in fluent, grammatically correct Urdu script (اردو).";
    } else {
      langInstruction = "LANGUAGE RULE: Reply in articulate, professional journalistic English.";
    }

    let dateGuidance = "";
    if (dateInfo) {
      dateGuidance = `MANDATORY DATE RESTRICTION: The user explicitly requested news for DATE: ${dateInfo.formattedFull} (${dateInfo.isYesterday ? "YESTERDAY" : "SPECIFIC DATE"}). You MUST strictly summarize headlines and events reported on ${dateInfo.formattedFull}. Do NOT report today's or any other date's news!`;
    }

    const timeGuidance = timeSlot
      ? `The user explicitly requested the ${timeSlot.slot} news bulletin. Focus strictly on what was reported in the ${timeSlot.slot} broadcast across these TV channels (${profile.channelNames}).`
      : `Focus on live news broadcast across leading TV channels in ${profile.name} (${profile.channelNames}).`;

    const prompt = `You are "Pulse AI News Intelligence" — a senior TV news correspondent and live intelligence analyst for Pulse News.

TASK:
Provide an accurate, authoritative news briefing in direct response to the user's question, grounded strictly in the provided broadcast reports and wire articles.

${langInstruction}

${dateGuidance}

TIME & MULTI-CHANNEL FOCUS:
${timeGuidance}

WRITING STYLE:
- Write 3 to 5 well-constructed, informative sentences synthesizing the top verified stories.
- Highlight key facts, political or economic developments, and channel sources.
- Spoken journalistic prose. NO markdown headings, NO bullet asterisks.

USER QUESTION: "${question}"

LIVE TV BROADCAST REPORTS (${profile.name}):
${broadcastList}

GROUNDED NEWS WIRES:
${articleList}

Deliver your briefing now:`;

    for (const model of GEMINI_MODELS) {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;
      const { controller, timeout } = makeController(FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600,
            },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) continue;

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
        if (text.trim()) {
          return text.trim();
        }
      } catch {
        clearTimeout(timeout);
        continue;
      }
    }
  }

  // High-Precision Neural News Synthesizer fallback
  return generateNeuralNewsSynthesis(question, profile, videos, articles, timeSlot, dateInfo, lang);
}

// ─── High-Precision Neural News Synthesizer ───────────────────────────────────

function cleanTitle(title) {
  if (!title) return "";
  return title
    .replace(/\s*\|\s*.*$/g, "")
    .replace(/\s*-\s*.*$/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\b(Breaking News|Big Breaking|Headlines|Live|Exclusive|Watch|Video)\b/gi, "")
    .trim();
}

function generateNeuralNewsSynthesis(question, profile, videos, articles, timeSlot, dateInfo, lang) {
  const dateLabel = dateInfo ? dateInfo.formattedFull : "";
  const timeLabel = timeSlot ? timeSlot.slot : "";
  const dateTimeLabel = [dateLabel, timeLabel].filter(Boolean).join(" ");

  // Extract clean story points from broadcast videos and articles
  const videoStories = videos.slice(0, 5).map((v) => ({
    title: cleanTitle(v.title),
    fullTitle: v.title,
    channel: v.channel || "TV Broadcast",
  })).filter((v) => v.title.length > 10);

  const articleStories = articles.slice(0, 4).map((a) => ({
    title: cleanTitle(a.title),
    desc: a.description || "",
    source: a.source?.name || a.source || "News Wire",
  })).filter((a) => a.title.length > 10);

  // Roman Urdu synthesis
  if (lang === "roman_urdu") {
    if (videoStories.length > 0 || articleStories.length > 0) {
      const topHeadlines = [...videoStories, ...articleStories]
        .slice(0, 3)
        .map((s) => `"${s.title}" (${s.channel || s.source})`)
        .join(", ");

      const channelMentions = profile.channelsList.slice(0, 4).join(", ");
      const intro = dateTimeLabel
        ? `${profile.name} ke leading TV channels (${channelMentions}) ke ${dateTimeLabel} ke bulletin ke mutabiq ahem khabrain yeh hain:`
        : `${profile.name} ke leading TV channels (${channelMentions}) aur news wires ke mutabiq taza tareen ahem khabrain yeh hain:`;

      const extraDetail = articleStories[0]?.desc
        ? ` Tafseelat ke mutabiq: ${articleStories[0].desc.slice(0, 160)}.`
        : " Mukammal reports aur video coverage aap neechay verified broadcast player mein dekh sakte hain.";

      return `${intro} ${topHeadlines}.${extraDetail}`;
    }

    return `${profile.name} ke top TV networks par ${dateTimeLabel || "is waqt"} ahem mulki aur bain-ul-aqwami khabrain live broadcast ki ja rahi hain. Neechay diye gaye verified clips aur articles mulahiza karein.`;
  }

  // Urdu Script synthesis
  if (lang === "ur_script") {
    if (videoStories.length > 0 || articleStories.length > 0) {
      const topHeadlines = [...videoStories, ...articleStories]
        .slice(0, 3)
        .map((s) => `"${s.title}" (${s.channel || s.source})`)
        .join("، ");

      const intro = dateTimeLabel
        ? `${profile.name} کے نمایاں ٹی وی چینلز کی ${dateTimeLabel} کی نشریات کی اہم خبریں یہ ہیں:`
        : `${profile.name} کے اہم ٹی وی چینلز اور لائیو نیوز وائرز کی تازہ ترین اہم خبریں یہ ہیں:`;

      return `${intro} ${topHeadlines}۔ تفصیلی ویڈیو رپورٹس اور بریکنگ اپڈیٹس نیچے منسلک پلیئر میں دیکھی جا سکتی ہیں۔`;
    }

    return `${profile.name} کے اہم ٹی وی چینلز پر ${dateTimeLabel || "تازہ نشریات میں"} اہم ملکی اور بین الاقوامی خبریں نشر کی گئیں۔ نیچے دی گئی رپورٹس دیکھیں۔`;
  }

  // English synthesis
  if (videoStories.length > 0 || articleStories.length > 0) {
    const storiesList = [...videoStories, ...articleStories].slice(0, 3);
    const headlinesFormatted = storiesList
      .map((s) => `• ${s.title} [${s.channel || s.source}]`)
      .join("\n");

    const channelSummary = profile.channelsList.slice(0, 4).join(", ");
    const intro = dateTimeLabel
      ? `Live TV broadcasts and news wires across ${profile.name} (${channelSummary}) for ${dateTimeLabel} report the following major developments:`
      : `Live TV broadcasts and news wire syndicates across ${profile.name} (${channelSummary}) are currently reporting key developing stories:`;

    const detailText = articleStories[0]?.desc
      ? `\n\nKey Context: ${articleStories[0].desc.slice(0, 180)}...`
      : "";

    return `${intro}\n\n${headlinesFormatted}${detailText}\n\nYou can watch the verified broadcast feeds directly below.`;
  }

  return `Live news monitoring for ${profile.name} (${profile.channelNames}) is actively tracking developing stories for ${dateTimeLabel || "the current news cycle"}. Explore the verified broadcast reports and articles below.`;
}

// ─── POST Handler ─────────────────────────────────────────────────────────────

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = (body?.message || "").trim();
  const country = (body?.country || "pk").toLowerCase();

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  // 1. Detect language (Roman Urdu, Urdu script, English)
  const lang = detectLanguage(message);

  // 2. Instant greeting response in matching language
  const greetingResult = checkGreeting(message, lang);
  if (greetingResult.isGreeting) {
    return NextResponse.json({
      answer: greetingResult.answer,
      videos: [],
      articles: [],
      query: message,
      isGreeting: true,
      lang,
    });
  }

  // 3. Identify target country & TV channel profile
  const profile = resolveTargetProfile(message, country);

  // 4. Extract exact time bulletin if requested (e.g. 9 PM, subah 9 baje, 10 PM)
  const timeSlot = extractTimeSlot(message);

  // 5. Extract exact date info (e.g. "yesterday", "kal", "18-8-2026", "18 August")
  const dateInfo = extractDateInfo(message);

  // 6. Time window and query sanitization
  const { from, to, cleanedMessage } = parseTimeWindow(message);
  const query = sanitizeQuery(cleanedMessage);

  // 7. Fetch verified TV broadcasts and news articles in parallel
  const [videos, articles] = await Promise.all([
    fetchBroadcastVideos({ query, profile, timeSlot, dateInfo }),
    fetchGroundingArticles({ query, profile, from, to }),
  ]);

  // 8. Generate accurate TV broadcast briefing
  const answer = await askGemini({
    question: message,
    profile,
    articles,
    videos,
    timeSlot,
    dateInfo,
    lang,
  });

  return NextResponse.json({
    answer,
    videos,
    articles: articles.slice(0, 4).map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name || a.source,
      publishedAt: a.publishedAt,
    })),
    query: query || message,
    country: profile.name,
    timeSlot: timeSlot?.slot || null,
    date: dateInfo?.formattedFull || null,
    lang,
  });
}