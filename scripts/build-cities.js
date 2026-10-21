// Builds lib/data/places.json, the list the submit form's location picker
// searches (app/api/places/route.js): every city of 15,000+ people plus every
// country, from GeoNames (CC BY 4.0 — https://www.geonames.org). Searching a
// local list keeps place lookups instant and private: no outside service sees
// what anyone types. Re-run only to refresh the data:
//
//   1. Download from https://download.geonames.org/export/dump/ into one folder:
//      cities15000.zip (unzip it to cities15000.txt), admin1CodesASCII.txt, countryInfo.txt
//   2. node scripts/build-cities.js <that folder>
const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/build-cities.js <folder with the GeoNames files>");
  process.exit(1);
}
const lines = (name) =>
  fs.readFileSync(path.join(dir, name), "utf8").split("\n").filter((l) => l && !l.startsWith("#"));

const countries = {}; // ISO2 -> { name, pop }
for (const l of lines("countryInfo.txt")) {
  const f = l.split("\t");
  countries[f[0]] = { name: f[4], pop: Number(f[7]) || 0 };
}

const regions = {}; // "DE.16" -> "Berlin"
for (const l of lines("admin1CodesASCII.txt")) {
  const [code, name] = l.split("\t");
  regions[code] = name;
}

// Row: [name, asciiName ("" when the same), country name, region, population]
const places = [];
for (const l of lines("cities15000.txt")) {
  const f = l.split("\t");
  const country = countries[f[8]];
  if (!country) continue;
  const region = regions[`${f[8]}.${f[10]}`] || "";
  places.push([f[1], f[2] === f[1] ? "" : f[2], country.name, region === f[1] ? "" : region, Number(f[14]) || 0]);
}
for (const c of Object.values(countries)) places.push([c.name, "", c.name, "", c.pop]);

// Biggest first, so a prefix search can stop at the first few matches.
places.sort((a, b) => b[4] - a[4]);
const out = path.join(__dirname, "..", "lib", "data", "places.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(places.map((p) => p.slice(0, 4))));
console.log(`${places.length} places -> ${path.relative(process.cwd(), out)} (${Math.round(fs.statSync(out).size / 1024)} KB)`);
