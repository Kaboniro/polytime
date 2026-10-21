#!/usr/bin/env bash
# Lets web traffic (80/443) reach this server only through Cloudflare, so
# nobody can skip Cloudflare's protection by connecting to the IP directly.
# SSH (22) is never touched. Installed by deploy/vps/setup.sh as
# /usr/local/bin/polytime-cloudflare.
#
#   polytime-cloudflare lock      allow 80/443 from Cloudflare's IP ranges only
#                                 (refuses unless the site is served via Cloudflare)
#   polytime-cloudflare unlock    back to 80/443 open to everyone
#   polytime-cloudflare refresh   re-fetch Cloudflare's ranges (weekly cron does this)
#   polytime-cloudflare status
#
# Turn Cloudflare's proxy off (grey cloud) or move DNS away from Cloudflare?
# Run `unlock` FIRST, or the site becomes unreachable.
set -euo pipefail

DOMAIN="${DOMAIN:-polytime.online}"
MARK=/etc/polytime-cloudflare-locked
TAG=cloudflare-web

[ "$(id -u)" = 0 ] || { echo "Run as root."; exit 1; }

ranges() {
  { curl -fsS https://www.cloudflare.com/ips-v4; echo; curl -fsS https://www.cloudflare.com/ips-v6; } | grep -E '^[0-9a-f:.]+/[0-9]+$'
}

# Delete our tagged rules whose range isn't in $1 (all of them when $1 is
# empty), highest rule number first so the numbering stays valid.
drop_cf_rules() {
  local keep=" $(echo "${1:-}" | tr '\n' ' ') "
  # (|| true: finding none is fine, and must not trip set -e/pipefail)
  { ufw status numbered | grep "# $TAG" || true; } \
    | sed -E 's/^\[ *([0-9]+)\] +[^ ]+ +ALLOW( IN)? +([^ ]+).*/\1 \3/' | sort -rn \
    | while read -r n range; do
        case "$keep" in *" $range "*) ;; *) ufw --force delete "$n" >/dev/null ;; esac
      done
}

# Add the current ranges first (existing ones are skipped), then drop any
# Cloudflare no longer lists — so a refresh never leaves a moment with no
# rule letting Cloudflare in.
add_cf_rules() {
  local list; list=$(ranges)
  [ "$(echo "$list" | wc -l)" -ge 10 ] || { echo "Couldn't fetch Cloudflare's IP ranges; nothing changed."; exit 1; }
  for r in $list; do
    ufw allow proto tcp from "$r" to any port 80,443 comment "$TAG" >/dev/null
  done
  drop_cf_rules "$list"
  # Keep Caddy's trusted list (who may say who the visitor is) in step.
  # Reload only when the list actually changed, so the weekly run is a no-op.
  local flat before; flat=$(echo "$list" | tr '\n' ' ' | sed 's/ $//')
  before=$(md5sum < /etc/caddy/Caddyfile)
  sed -i -E "s#^(\s*trusted_proxies static ).*#\1$flat#; s#^(\s*@direct not remote_ip ).*#\1$flat#" /etc/caddy/Caddyfile
  if [ "$before" != "$(md5sum < /etc/caddy/Caddyfile)" ]; then
    caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null 2>&1 && systemctl reload caddy
  fi
  echo "$(echo "$list" | wc -l) Cloudflare ranges allowed on 80/443."
}

case "${1:-status}" in
  lock)
    if [ "${2:-}" != "--force" ] && ! curl -fsSI --max-time 15 "https://$DOMAIN/" | grep -qi '^server: *cloudflare'; then
      echo "https://$DOMAIN isn't being served through Cloudflare yet (no 'server: cloudflare' header)."
      echo "Locking now would take the site offline. Finish the Cloudflare setup first."
      exit 1
    fi
    add_cf_rules
    ufw --force delete allow 80/tcp >/dev/null 2>&1 || true
    ufw --force delete allow 443/tcp >/dev/null 2>&1 || true
    touch "$MARK"
    echo "Locked: the web ports now only accept Cloudflare. SSH unchanged."
    ;;
  unlock)
    ufw allow 80/tcp >/dev/null
    ufw allow 443/tcp >/dev/null
    drop_cf_rules
    rm -f "$MARK"
    echo "Unlocked: 80/443 open to everyone again."
    ;;
  refresh)
    [ -f "$MARK" ] || { echo "Not locked; nothing to refresh."; exit 0; }
    add_cf_rules
    ;;
  status)
    if [ -f "$MARK" ]; then echo "Locked to Cloudflare."; else echo "Not locked (80/443 open to everyone)."; fi
    ufw status | grep -E "80|443" | sed -n '1,6p'
    ;;
  *) echo "Usage: polytime-cloudflare lock|unlock|refresh|status"; exit 1 ;;
esac
