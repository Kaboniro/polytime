import { NextResponse } from "next/server";
import { clientIp, rateLimited } from "@/lib/rateLimit";
import PLACES from "@/lib/data/places.json";

// Place suggestions for the submit form's location picker. Searches a local
// list — every city of 15,000+ people plus every country, from GeoNames
// (CC BY 4.0), built by scripts/build-cities.js — rather than an online
// geocoder: the public OpenStreetMap ones were either too slow for
// search-as-you-type (Photon, ~10 s from this server) or matched whole words
// only (Nominatim: "berl" never finds Berlin). Local means instant, and no
// outside service ever sees what anyone types.
//
// Each row is [name, asciiName or "", country, region or ""], biggest
// population first, so the first matches found are the likeliest ones.

const fold = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Lowercased, accent-free names, built once on first use.
let index = null;
function getIndex() {
  return (index ||= PLACES.map(([name, ascii]) => {
    const n = fold(name);
    return { n, a: ascii ? fold(ascii) : n };
  }));
}

// A name matches when it, or any word in it, starts with the query:
// "berl" → Berlin, "york" → New York, "sao" → São Paulo.
function matches(text, q) {
  return text.startsWith(q) || text.includes(" " + q) || text.includes("-" + q);
}

export async function GET(req) {
  const q = fold((new URL(req.url).searchParams.get("q") || "").trim().replace(/\s+/g, " ").slice(0, 80));
  if (q.length < 2) return NextResponse.json({ places: [] });
  if (rateLimited(`places:${clientIp(req)}`, 120, 60_000)) {
    return NextResponse.json({ error: "Too many searches; try again in a minute." }, { status: 429 });
  }

  const idx = getIndex();
  const places = [];
  const seen = new Set();
  // Whole-name prefix matches first (they're what people mean), then word matches.
  for (const pass of [(t) => t.startsWith(q), (t) => matches(t, q)]) {
    for (let i = 0; i < idx.length && places.length < 8; i++) {
      if (seen.has(i) || !(pass(idx[i].n) || pass(idx[i].a))) continue;
      seen.add(i);
      const [name, , country, region] = PLACES[i];
      places.push({ label: name === country ? country : `${name}, ${country}`, hint: region || null });
    }
  }
  return NextResponse.json({ places });
}
