#!/usr/bin/env bash
# Sets up a fresh Debian 12 / Ubuntu 22.04+ VPS to run PolyTime from the
# prebuilt `deploy` branch (no build on the server, so 1 GB of RAM is enough):
#
#   Node 24 + systemd   the app (and its crawler), on 127.0.0.1:3000 only
#   Docker              SearXNG, the crawler's search engine, on 127.0.0.1:8888 only
#   Caddy               HTTPS for DOMAIN (+ www redirect), certificates automatic
#   ufw + fail2ban      only SSH/80/443 open; SSH brute-force protection
#   cron                daily SQLite backup to /var/backups/polytime (14 kept)
#
# Run as root. Safe to re-run: it never overwrites .env.production or the
# database, and only (re)creates what's missing or out of date.
#
#   curl -fsSL https://raw.githubusercontent.com/Kaboniro/polytime/main/deploy/vps/setup.sh | bash
#   # or with settings:  DOMAIN=example.com ADMIN_EMAIL=me@example.com bash setup.sh
set -euo pipefail

DOMAIN="${DOMAIN:-polytime.online}"
ADMIN_EMAIL="${ADMIN_EMAIL:-}"
REPO="${REPO:-https://github.com/Kaboniro/polytime.git}"
BRANCH="${BRANCH:-deploy}"
APP_DIR=/opt/polytime
APP_USER=polytime
ENV_FILE="$APP_DIR/server/.env.production"
RAW="https://raw.githubusercontent.com/Kaboniro/polytime/main"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
[ "$(id -u)" = 0 ] || { echo "Run as root."; exit 1; }
export DEBIAN_FRONTEND=noninteractive

say "System packages and automatic security updates"
apt-get update -q
apt-get upgrade -yq
apt-get install -yq curl git ca-certificates gnupg ufw fail2ban sqlite3 unattended-upgrades \
  debian-keyring debian-archive-keyring apt-transport-https
dpkg-reconfigure -fnoninteractive unattended-upgrades

say "Swap (a 1 GB server needs ~2 GB total for comfort)"
swap_mb=$(free -m | awk '/^Swap:/ {print $2}')
if [ "$swap_mb" -lt 1500 ] && [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
sysctl -qw vm.swappiness=10
echo 'vm.swappiness=10' > /etc/sysctl.d/99-polytime.conf

say "Firewall (SSH, HTTP, HTTPS only) and fail2ban"
ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null
# Debian 12 logs SSH to the journal, not /var/log/auth.log, so fail2ban must
# read the journal or it refuses to start.
apt-get install -yq python3-systemd
printf '[DEFAULT]\nbackend = systemd\n\n[sshd]\nenabled = true\n' > /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl restart fail2ban

say "Node.js 24"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 24 ]; then
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -yq nodejs
fi
node -v

say "Docker (for SearXNG only)"
command -v docker >/dev/null || apt-get install -yq docker.io
systemctl enable --now docker

say "Caddy"
if ! command -v caddy >/dev/null; then
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q && apt-get install -yq caddy
fi

say "App code ($BRANCH branch) in $APP_DIR"
id "$APP_USER" >/dev/null 2>&1 || useradd --system --home "$APP_DIR" --shell /usr/sbin/nologin "$APP_USER"
if [ -d "$APP_DIR/.git" ]; then
  runuser -u "$APP_USER" -- git -C "$APP_DIR" pull --ff-only -q
else
  git clone -q --branch "$BRANCH" --depth 1 "$REPO" "$APP_DIR"
  chown -R "$APP_USER:$APP_USER" "$APP_DIR"
fi
install -d -o "$APP_USER" -g "$APP_USER" -m 700 "$APP_DIR/server/data"

say "Settings ($ENV_FILE)"
if [ ! -f "$ENV_FILE" ]; then
  admin_pw=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
  cat > "$ENV_FILE" <<EOF
# PolyTime production settings. After editing: systemctl restart polytime
SITE_URL=https://$DOMAIN

# Admin sign-in (password, then a code emailed to ADMIN_EMAIL)
ADMIN_PASSWORD=$admin_pw
ADMIN_SECRET=$(openssl rand -hex 32)
ADMIN_EMAIL=$ADMIN_EMAIL

# Email for the sign-in code. Gmail: SMTP_PASS is an app password from
# https://myaccount.google.com/apppasswords (NOT your normal password).
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=$ADMIN_EMAIL
SMTP_PASS=
SMTP_FROM="PolyTime Admin <$ADMIN_EMAIL>"

# Shown on /privacy for removal requests (empty = hidden)
CONTACT_EMAIL=

# Crawler: runs inside the app, searching via the local SearXNG
CRAWLER_ENABLED=1
SEARXNG_URL=http://127.0.0.1:8888
TRANSLATE_EMAIL=$ADMIN_EMAIL
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created. Admin password and secret were generated; fill in SMTP_PASS."
else
  echo "Exists; left unchanged."
fi

say "SearXNG (127.0.0.1:8888)"
if [ ! -f /etc/searxng/settings.yml ]; then
  install -d /etc/searxng
  curl -fsSL "$RAW/deploy/searxng/settings.yml" \
    | sed "s/ultrasecretkey/$(openssl rand -hex 32)/" > /etc/searxng/settings.yml
fi
if ! docker ps -a --format '{{.Names}}' | grep -qx searxng; then
  docker run -d --name searxng --restart unless-stopped \
    -p 127.0.0.1:8888:8080 --memory 350m \
    -e SEARXNG_BASE_URL=http://127.0.0.1:8888/ \
    -v /etc/searxng:/etc/searxng \
    searxng/searxng:latest >/dev/null
fi

say "App service (systemd)"
cat > /etc/systemd/system/polytime.service <<EOF
[Unit]
Description=PolyTime (Next.js app + crawler)
After=network-online.target docker.service
Wants=network-online.target

[Service]
User=$APP_USER
WorkingDirectory=$APP_DIR/server
Environment=NODE_ENV=production PORT=3000 HOSTNAME=127.0.0.1 NEXT_TELEMETRY_DISABLED=1
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
# 143 = stopped by SIGTERM (systemctl stop/restart): a clean stop, not a failure.
SuccessExitStatus=143
NoNewPrivileges=true
ProtectSystem=full
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable polytime >/dev/null
systemctl restart polytime

say "Caddy site ($DOMAIN, ready for Cloudflare's proxy)"
# With Cloudflare in front, every request arrives from a Cloudflare IP. Trust
# only those ranges to say who the visitor is (CF-Connecting-IP), and hand the
# app exactly that one IP in X-Forwarded-For — the rate limiter keys on it, so
# a client-supplied chain must never get through. Requests that skip
# Cloudflare lose any cf-* location headers so they can't fake analytics.
# Works unchanged without Cloudflare (client_ip is then just the peer).
cf_ranges=$( { curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6; } | tr -s '\n' ' ')
[ -n "${cf_ranges// /}" ] || { echo "Couldn't fetch Cloudflare IP ranges."; exit 1; }
cat > /etc/caddy/Caddyfile <<EOF
# Managed by PolyTime's deploy/vps/setup.sh
{
	servers {
		trusted_proxies static $cf_ranges
		client_ip_headers CF-Connecting-IP
	}
}

$DOMAIN {
	encode zstd gzip
	@direct not remote_ip $cf_ranges
	request_header @direct -Cf-Ipcountry
	request_header @direct -Cf-Region-Code
	reverse_proxy 127.0.0.1:3000 {
		header_up X-Forwarded-For {client_ip}
	}
}

www.$DOMAIN {
	redir https://$DOMAIN{uri} permanent
}
EOF
systemctl reload caddy 2>/dev/null || systemctl restart caddy

say "Daily database backup and the update command"
cat > /etc/cron.daily/polytime-backup <<EOF
#!/bin/sh
# Consistent copy of the live database (safe while the app runs); keeps 14.
set -e
mkdir -p /var/backups/polytime && chmod 700 /var/backups/polytime
[ -f $APP_DIR/server/data/app.db ] || exit 0
sqlite3 $APP_DIR/server/data/app.db ".backup /var/backups/polytime/app-\$(date +%F).db"
ls -1t /var/backups/polytime/app-*.db | tail -n +15 | xargs -r rm -f
EOF
chmod 755 /etc/cron.daily/polytime-backup

cat > /usr/local/bin/polytime-update <<EOF
#!/bin/sh
# Pull the latest build from the $BRANCH branch and restart the app.
set -e
runuser -u $APP_USER -- git -C $APP_DIR pull --ff-only
systemctl restart polytime
sleep 5
curl -fsS http://127.0.0.1:3000/api/health && echo " — PolyTime is up."
EOF
chmod 755 /usr/local/bin/polytime-update

say "Health check"
for _ in $(seq 1 30); do curl -fsS http://127.0.0.1:3000/api/health >/dev/null 2>&1 && break; sleep 1; done
curl -fsS http://127.0.0.1:3000/api/health && echo " — app is up on 127.0.0.1:3000"

ip=$(curl -fsS -4 https://ifconfig.me || true)
cat <<EOF

Done.
  * Point DNS for $DOMAIN and www.$DOMAIN (A records) at ${ip:-this server}.
    Caddy fetches the HTTPS certificate automatically once DNS resolves here.
  * Fill in SMTP_PASS (and check the rest):  nano $ENV_FILE
    then:  systemctl restart polytime
  * Admin password:  grep ADMIN_PASSWORD $ENV_FILE
  * Logs:  journalctl -u polytime -f      Update later:  polytime-update
EOF
