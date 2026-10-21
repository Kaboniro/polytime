// Builds a ready-to-run copy of the app and commits it to the `deploy` branch,
// for hosts that pull from git and can't build (cPanel Git Version Control +
// Setup Node.js App). Nothing to install or build on the server.
//
//   npm run build:deploy           # build + commit to the deploy branch
//   git push origin deploy         # then publish it
//
// Branch layout (see deploy/cpanel/DEPLOY.md, copied in as the README):
//   node_modules/   the packages the app and crawler need, already installed
//   server/         the cPanel "Application root": server.js, .next, public,
//                   crawler, plus data/ and .env.production created on the
//                   server (both ignored, so a git pull never touches them)
// node_modules sits one level above the application root on purpose:
// CloudLinux's Node selector refuses an application root that has its own
// node_modules folder, and Node finds packages in parent folders anyway.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const BRANCH = "deploy";
const work = path.join(root, ".deploy-worktree");

function run(cmd, args, opts = {}) {
  // npx is a .cmd on Windows and needs a shell; git must not get one, or
  // paths with spaces (".../SOFTWARE PROJECTS/...") are split apart.
  const shell = cmd === "npx" && process.platform === "win32";
  const r = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell, ...opts });
  if (r.status !== 0) {
    console.error(`\n${cmd} ${args.join(" ")} failed.`);
    process.exit(1);
  }
}
const git = (args, cwd = root) =>
  spawnSync("git", args, { cwd, encoding: "utf8" });
const copy = (from, to) => fs.cpSync(from, to, { recursive: true, dereference: true });

// 1. Standalone build.
run("npx", ["next", "build"], { env: { ...process.env, BUILD_STANDALONE: "1", NEXT_TELEMETRY_DISABLED: "1" } });
const standalone = path.join(root, ".next", "standalone");
if (!fs.existsSync(path.join(standalone, "server.js"))) {
  console.error("No .next/standalone/server.js — the standalone build didn't happen.");
  process.exit(1);
}

// 2. Check out the deploy branch in a side folder (created empty the first time).
if (!fs.existsSync(work)) {
  const exists = git(["rev-parse", "--verify", "--quiet", BRANCH]).status === 0
    || git(["rev-parse", "--verify", "--quiet", `origin/${BRANCH}`]).status === 0;
  if (exists) run("git", ["worktree", "add", work, BRANCH]);
  else run("git", ["worktree", "add", "--orphan", "-b", BRANCH, work]);
}

// 3. Replace everything on the branch with the fresh build.
for (const name of fs.readdirSync(work)) {
  if (name !== ".git") fs.rmSync(path.join(work, name), { recursive: true, force: true });
}
const server = path.join(work, "server");
fs.mkdirSync(server, { recursive: true });
for (const name of fs.readdirSync(standalone)) {
  if (name === "node_modules" || name === "data" || name.startsWith(".env")) continue;
  copy(path.join(standalone, name), path.join(server, name));
}
copy(path.join(standalone, "node_modules"), path.join(work, "node_modules"));
// sharp is only for next/image optimisation, which the app doesn't use, and
// the copy traced here is a native binary for *this* machine's OS.
for (const name of ["sharp", "@img"]) fs.rmSync(path.join(work, "node_modules", name), { recursive: true, force: true });
copy(path.join(root, ".next", "static"), path.join(server, ".next", "static"));
copy(path.join(root, "public"), path.join(server, "public"));
// The crawler isn't part of the traced app: it runs as its own process
// (instrumentation-node.js, or a cron job), so it and undici go in by hand.
copy(path.join(root, "crawler"), path.join(server, "crawler"));
copy(path.join(root, "lib", "geography.js"), path.join(server, "lib", "geography.js")); // read as text by crawl.js
copy(path.join(root, "node_modules", "undici"), path.join(work, "node_modules", "undici"));
copy(path.join(root, "deploy", "env.production.example"), path.join(server, ".env.production.example"));
copy(path.join(root, "deploy", "cpanel", "DEPLOY.md"), path.join(work, "README.md"));
fs.writeFileSync(
  path.join(work, ".gitignore"),
  ["# Created on the server; a git pull must never touch them.", "server/data/", "server/.env.production", "server/.env.local", "server/tmp/", "server/node_modules", "*.log", ""].join("\n")
);

// 4. Commit.
run("git", ["add", "-A"], { cwd: work });
if (git(["diff", "--cached", "--quiet"], work).status === 0) {
  console.log("\nDeploy branch already matches this build; nothing to commit.");
  process.exit(0);
}
const source = git(["rev-parse", "--short", "HEAD"]).stdout.trim();
run("git", ["commit", "-q", "-m", `Build of ${source}`], { cwd: work });
console.log(`\nCommitted the build of ${source} to the '${BRANCH}' branch. Publish it with:\n  git push origin ${BRANCH}`);
