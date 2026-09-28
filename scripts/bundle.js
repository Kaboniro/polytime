// Packs the project into one archive you can upload to a server:
//
//   npm run bundle                 # source only (the server installs and builds)
//   npm run bundle -- --with-build # also includes .next (run `npm run build` first;
//                                  #   the server's Node version must match this one)
//
// The archive never contains secrets or your local data: .env.local /
// .env.production, the SQLite database (data/), node_modules, dev caches,
// logs, and the original photo folder (only public/images is needed).
// Uses the `tar` that ships with Windows 10+, macOS and Linux.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const withBuild = process.argv.includes("--with-build");
if (withBuild && !fs.existsSync(path.join(root, ".next", "BUILD_ID"))) {
  console.error("No production build found. Run `npm run build` first, or drop --with-build.");
  process.exit(1);
}

const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const name = `polytime-${withBuild ? "built-" : ""}${stamp}.tar.gz`;
const out = path.join(outDir, name);
// Relative paths only: GNU tar (Git for Windows) reads "C:\..." as a remote host.
const rel = `dist/${name}`;

const exclude = [
  "./node_modules", "./data", "./dist", "./.git", "./images", "./.env.local", "./.env.production",
  "./.env.development", "./.env.test", "*.log", "./next-env.d.ts", "./tsconfig.tsbuildinfo",
  ...(withBuild ? [] : ["./.next"]),
  ...(withBuild ? ["./.next/cache"] : []),
];
const r = spawnSync("tar", ["-czf", rel, ...exclude.map((e) => `--exclude=${e}`), "."], { encoding: "utf8", cwd: root });
if (r.status !== 0) {
  console.error("tar failed:", r.stderr || r.error);
  process.exit(1);
}

// Safety net: refuse to hand over an archive that contains anything private.
const list = spawnSync("tar", ["-tzf", rel], { encoding: "utf8", cwd: root, maxBuffer: 64 * 1024 * 1024 }).stdout.split(/\r?\n/);
const leaked = list.filter((f) => /(^|\/)\.env\.(local|production)$|(^|\/)data\/|(^|\/)node_modules\/|\.db(-wal|-shm)?$/.test(f));
if (leaked.length) {
  fs.unlinkSync(out);
  console.error("Refusing to bundle: private/large files ended up in the archive:\n  " + leaked.slice(0, 10).join("\n  "));
  process.exit(1);
}

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`Created ${path.relative(root, out)} (${mb} MB, ${list.filter(Boolean).length} entries)`);
console.log("Next: upload it, extract it, then follow README > Deploying.");
