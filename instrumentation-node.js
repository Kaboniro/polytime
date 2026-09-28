// Launches the background event crawler (crawler/daemon.js) as a child
// process so it is always running while the app is — no separate terminal or
// scheduler needed. Set CRAWLER_ENABLED=0 to turn that off (you can still run
// `npm run crawl:watch` yourself). It's a separate process on purpose: the
// crawler is plain Node code that shouldn't be bundled with the app, and a
// crash in it can't take the site down.
import { spawn } from "node:child_process";
import path from "node:path";

if (process.env.CRAWLER_ENABLED !== "0" && !globalThis.__polytimeCrawler) {
  const child = spawn(process.execPath, [path.join(process.cwd(), "crawler", "daemon.js")], {
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, CRAWLER_PARENT_PID: String(process.pid) },
  });
  globalThis.__polytimeCrawler = child;
  child.on("exit", () => {
    globalThis.__polytimeCrawler = null;
  });
  process.on("exit", () => child.kill());
}

// Optional: also start a local SearXNG (the crawler's free search engine)
// when SEARXNG_AUTOSTART=wsl and SEARXNG_URL points at this machine. It runs
// inside WSL from ~/searxng (see README "Running SearXNG"), and is stopped
// with the app. Skipped if something is already answering on that address.
async function startSearxngInWsl() {
  const url = process.env.SEARXNG_URL;
  if (process.platform !== "win32" || process.env.SEARXNG_AUTOSTART !== "wsl" || !url) return;
  const { hostname } = new URL(url);
  if (!["localhost", "127.0.0.1"].includes(hostname)) return;
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) });
    return; // already up
  } catch {
    // not answering: start it
  }
  const distro = process.env.SEARXNG_WSL_DISTRO || "Ubuntu";
  const dir = process.env.SEARXNG_WSL_DIR || "~/searxng";
  const cmd = `cd ${dir}/src && SEARXNG_SETTINGS_PATH=${dir}/settings.yml exec ${dir}/venv/bin/python -m searx.webapp`;
  const child = spawn("wsl.exe", ["-d", distro, "--", "bash", "-lc", cmd], { stdio: "ignore", windowsHide: true });
  globalThis.__polytimeSearxng = child;
  child.on("exit", () => {
    globalThis.__polytimeSearxng = null;
  });
  process.on("exit", () => child.kill());
}
if (!globalThis.__polytimeSearxng) startSearxngInWsl().catch(() => {});

// Production sanity checks: say so loudly at startup instead of failing quietly
// later (wrong canonical URLs, a guessable admin password, no way to email the
// sign-in code). Warnings only; nothing here stops the server.
if (process.env.NODE_ENV === "production") {
  const problems = [];
  const site = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (!site || /localhost|127\.0\.0\.1/.test(site)) problems.push("SITE_URL is not set to your public address, so canonical links, the sitemap and share cards point at localhost.");
  if ((process.env.ADMIN_SECRET || "").length < 32) problems.push("ADMIN_SECRET is missing or shorter than 32 characters.");
  if ((process.env.ADMIN_PASSWORD || "").length < 12) problems.push("ADMIN_PASSWORD is missing or shorter than 12 characters.");
  if (!process.env.ADMIN_EMAIL) problems.push("ADMIN_EMAIL is not set, so the admin sign-in code has nowhere to go and nobody can log in.");
  const smtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
  const emailjs = process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY;
  if (!smtp && !emailjs) problems.push("No email provider (SMTP_* or EMAILJS_*) is configured, so admin login will refuse to work.");
  for (const p of problems) console.warn(`[polytime] PRODUCTION WARNING: ${p}`);
}
