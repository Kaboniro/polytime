// Startup file for hosts that run the app from a single .js entry point
// (cPanel "Setup Node.js App" / Phusion Passenger) instead of `next start`.
// Run `npm run build` first; this only serves the existing .next build.
//
// Production unless NODE_ENV=development is set explicitly, so a host that
// leaves NODE_ENV unset never ends up running the dev server. Next loads
// .env.production itself, exactly as `next start` would. Passenger hands the
// app its own PORT (or intercepts listen()), so the 3000 fallback is local only.
const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> PolyTime listening on port ${port} (${dev ? "development" : "production"})`);
  });
});
