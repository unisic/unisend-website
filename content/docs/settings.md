---
title: "Settings and devices"
description: "Where each setting lives, moving your settings to another device, and managing the devices signed in to your account."
order: 8
group: "Using Unisend"
---

## Where things are

| Settings page | What it holds |
|---|---|
| Profile | Your name and picture. With a Beeper account this is your Beeper profile; WhatsApp, Signal and the other networks keep the name and picture you have there. |
| Appearance | Theme, language, chat color, wallpaper, text size, large emoji, the emoji font |
| Chats | Message status, chat folders, swipe actions, keep muted chats archived, reactions, Enter sends and keyboard shortcuts (desktop), reduce motion |
| Notifications | Background connection, what notifications show, sounds, notification profiles |
| Data and storage | Storage used, clearing the media cache, how long messages stay in search, media auto-download, the settings file, syncing with another device |
| Privacy and security | Reading and typing, link previews, blocked people, app lock, screen security and the incognito keyboard (Android) |
| Devices | Your signed-in devices, verification, the recovery code |
| Account | Signing out |

## Moving settings to another device

Settings, Data and storage has three ways. Each moves the app's settings and nothing else: no messages, keys or passwords. What only makes sense on one device stays there: the app lock and its PIN, your own emoji font, your own sounds, wallpaper photos and the background connection.

### A settings file

**Export settings** writes a file to Downloads. On the other device, **Import settings** reads it and asks before replacing yours. Settings for single chats name each chat by its Matrix room id.

### From another device, through your server

**Get from another device** takes the settings of one of your verified devices. They travel end-to-end encrypted, so your homeserver sees only that two of your devices exchanged a message, when, and how large. Verify this device first, in Settings, Devices.

### Over the local network

With both devices on the same network: choose **Get over local network** on the one that receives, and **Send over local network** on the other. No server takes part. Check that both screens show the same number, then choose on the sending device what to send (appearance, chats, notifications, privacy, media, settings for single chats). Only the parts switched on replace yours.

The receiving device announces a random key and a port by broadcast to everyone on that network, so others on the network can see that a device is waiting. Your settings go over the encrypted channel only after the numbers match.

## Devices

Settings, Devices lists every device signed in to your account.

- **Verify** a device by checking that both screens show the same emoji. Once this device is verified, messages it could not read may unlock.
- **Sign out** a device you no longer use or do not recognize. Some servers ask for your password or a confirmation first.
- **Recovery code**: show it to copy to another device, or make a new one. See [Sign in](/docs/sign-in#encrypted-history-on-a-new-device).
