# PolyTime production image: Next.js app + the background event crawler
# (the crawler is started by the app itself, see instrumentation-node.js).
# Needs Node 22.5+ for the built-in node:sqlite; this uses Node 24.
#
#   docker build -t polytime .
#   docker run -p 3000:3000 --env-file .env.production -v polytime-data:/app/data polytime
# ...or use docker-compose.yml, which also runs the search engine.

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# `next build` downloads the Nunito font from Google, so this stage needs internet.
FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY next.config.mjs instrumentation.js instrumentation-node.js proxy.js ./
# The crawler runs as plain Node next to the app and reads lib/geography.js at runtime.
COPY crawler ./crawler
COPY lib ./lib
COPY scripts ./scripts
# All content (the SQLite file, WAL and the crawler's history) lives in /app/data:
# mount a volume there or it is lost when the container is replaced.
RUN mkdir -p /app/data && chown -R node:node /app
USER node
VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "start"]
