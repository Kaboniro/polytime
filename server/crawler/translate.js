// Free machine translation of event descriptions to English. No paid key.
//
//   - Default: MyMemory (https://mymemory.translated.net) — free, no signup.
//     Anonymous quota is ~5,000 characters/day; setting TRANSLATE_EMAIL to any
//     real address raises it to ~50,000/day. Only *accepted* candidates are
//     translated, and only their description, so a normal day uses a few thousand.
//   - Better/unlimited: self-host LibreTranslate (free, open source) and set
//     LIBRETRANSLATE_URL (and LIBRETRANSLATE_API_KEY if you enabled keys).
//
// Translation is best-effort: on any failure the original text is kept and the
// caller notes that. Titles are deliberately not translated.
const { fetch } = require("undici");

// Script-based guess, used when the page doesn't declare a language.
function detectLang(text, declared) {
  const d = (declared || "").toLowerCase();
  if (/^ko/.test(d)) return "ko";
  if (/^ja/.test(d)) return "ja";
  if (/^zh[-_]?(tw|hk|hant)/.test(d)) return "zh-TW";
  if (/^zh/.test(d)) return "zh-CN";
  if (/^th/.test(d)) return "th";
  if (/^vi/.test(d)) return "vi";
  if (/^id|^ms/.test(d)) return "id";
  const eu = d.match(/^(de|fr|es|it|pt|nl|pl|ru|tr)/);
  if (eu) return eu[1];
  if (/^en/.test(d)) return "en";
  const t = text.slice(0, 400);
  if (/[가-힯]/.test(t)) return "ko";
  if (/[぀-ヿ]/.test(t)) return "ja";
  if (/[฀-๿]/.test(t)) return "th";
  if (/[一-鿿]/.test(t)) return "zh-CN";
  if (/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(t)) return "vi";
  return "en"; // Latin text with no other signal: assume English, leave untouched
}

// Split at sentence-ish boundaries into chunks the free APIs accept.
function chunk(text, max = 420) {
  const parts = text.split(/(?<=[.!?。！？])\s*/).filter(Boolean);
  const out = [];
  let cur = "";
  for (const p of parts) {
    if ((cur + p).length > max && cur) {
      out.push(cur);
      cur = "";
    }
    if (p.length > max) {
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max));
    } else {
      cur += (cur ? " " : "") + p;
    }
  }
  if (cur) out.push(cur);
  return out;
}

async function viaMyMemory(part, from) {
  const params = new URLSearchParams({ q: part, langpair: `${from}|en` });
  if (process.env.TRANSLATE_EMAIL) params.set("de", process.env.TRANSLATE_EMAIL);
  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, { signal: AbortSignal.timeout(15000) });
  const data = await res.json();
  const out = data?.responseData?.translatedText;
  if (data.responseStatus !== 200 || !out || /MYMEMORY WARNING|QUERY LENGTH LIMIT/i.test(out)) {
    throw new Error(data?.responseDetails || "MyMemory quota or error");
  }
  return out;
}

async function viaLibre(part, from) {
  const res = await fetch(`${process.env.LIBRETRANSLATE_URL.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: part, source: from.split("-")[0], target: "en", format: "text", api_key: process.env.LIBRETRANSLATE_API_KEY || undefined }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await res.json();
  if (!res.ok || !data.translatedText) throw new Error(data.error || `LibreTranslate HTTP ${res.status}`);
  return data.translatedText;
}

// Returns { text, from, translated: bool, error? }.
async function toEnglish(text, declaredLang) {
  const from = detectLang(text, declaredLang);
  if (from === "en" || !text.trim()) return { text, from, translated: false };
  const one = process.env.LIBRETRANSLATE_URL ? viaLibre : viaMyMemory;
  try {
    const parts = [];
    for (const c of chunk(text)) parts.push(await one(c, from));
    return { text: parts.join(" ").replace(/\s+/g, " ").trim(), from, translated: true };
  } catch (e) {
    return { text, from, translated: false, error: e.message };
  }
}

module.exports = { toEnglish, detectLang };
