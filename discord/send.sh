#!/bin/sh
# Posts unisend.json to a Discord channel through a webhook, as a Components V2 message. Per the
# webhook docs a Components V2 message may carry nothing but `components` (no `files[n]`), so the
# icon, the screenshots and the button point at the site, which must be reachable from the web.
# The webhook URL is a secret: pass it in the environment, never as an argument.
#   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... SITE_URL=https://unisend.example ./discord/send.sh
set -eu
: "${DISCORD_WEBHOOK_URL:?set DISCORD_WEBHOOK_URL to the channel's webhook URL}"
: "${SITE_URL:?set SITE_URL to where the site is served, for the images and the button}"
here=$(cd "$(dirname "$0")" && pwd)

# Every `url` in the payload is a path on the site; prefix it with SITE_URL.
jq -c --arg site "${SITE_URL%/}" 'walk(if type == "object" and (.url? | type) == "string" and (.url | startswith("/")) then .url = $site + .url else . end)' \
  "$here/unisend.json" > /tmp/unisend-discord-payload.json

# with_components: a webhook not owned by an app ignores `components` without it.
curl -sS -o /tmp/unisend-discord.json -w 'HTTP %{http_code}\n' \
  -H 'Content-Type: application/json' \
  --data-binary @/tmp/unisend-discord-payload.json \
  "$DISCORD_WEBHOOK_URL?wait=true&with_components=true"
jq -c '{ id, message, errors } | with_entries(select(.value != null))' /tmp/unisend-discord.json | head -c 2000; echo
