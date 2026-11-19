#!/bin/sh
# Posts unisend.json to a Discord channel through a webhook, as a Components V2 message, with the
# icon and screenshots uploaded as its attachments. The webhook URL is a secret: pass it in the
# environment, never as an argument, so it stays out of shell history and process lists.
#   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... ./discord/send.sh
# Optional SITE_URL adds a link button to the site under the card.
set -eu
: "${DISCORD_WEBHOOK_URL:?set DISCORD_WEBHOOK_URL to the channel's webhook URL}"
here=$(cd "$(dirname "$0")" && pwd)
shots="$here/../static/shots"

jq -c --arg site "${SITE_URL:-}" '
  if $site == "" then . else
    .components[0].components += [{ type: 1, components: [{ type: 2, style: 5, label: "Website", url: $site }] }]
  end' "$here/unisend.json" > /tmp/unisend-discord-payload.json

# with_components: a webhook not owned by an app ignores `components` without it.
curl -sS -o /tmp/unisend-discord.json -w 'HTTP %{http_code}\n' \
  -F "payload_json=</tmp/unisend-discord-payload.json;type=application/json" \
  -F "files[0]=@$here/icon.png" \
  -F "files[1]=@$shots/desktop.png" \
  -F "files[2]=@$shots/chat-list.png" \
  -F "files[3]=@$shots/chat.png" \
  -F "files[4]=@$shots/settings.png" \
  "$DISCORD_WEBHOOK_URL?wait=true&with_components=true"
jq -c '{ id, message, errors } | with_entries(select(.value != null))' /tmp/unisend-discord.json | head -c 2000; echo
