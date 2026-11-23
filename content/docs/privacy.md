---
title: "What leaves your device"
description: "Every party Unisend talks to, when, and what each one sees. No telemetry, no crash reports, no Google services."
order: 9
group: "Privacy and security"
---

Unisend sends nothing to its developers. There are no Google services, no telemetry, no crash reporting and no push service. What does leave the device, and who sees it:

## Your homeserver

It sees what any Matrix server sees: your account, the rooms you are in, message metadata, your IP address, and the content of unencrypted rooms. Encrypted rooms are end-to-end encrypted.

Media and avatars are loaded from the homeserver. With media auto-download on (Settings, Data and storage), it also sees the audio and documents fetched before you open them.

## Beeper

Only with a Beeper account: the sign-in at `api.beeper.com`, the homeserver `matrix.beeper.com`, and the bridges.

A bridge has to read a message to pass it between Matrix and the other network, so Beeper's bridges see the content of bridged chats, and the other network (WhatsApp, Messenger and so on) sees what it always sees.

Signing in to some networks opens that network's own login page. On Android and Linux it opens in the app's own browser window, which keeps its cookies and storage in memory only and hands them to the bridge, nothing else.

## Merged chats

Merging chats makes one more room on your homeserver, with only you in it, holding its name, a picture taken from one of the chats, and the IDs of the chats it joins. Your homeserver (and Beeper, with a Beeper account) sees which chats you merged; the people in them and the bridges are not told.

## Sites you link to

Link previews are on by default (Settings, Privacy and security, **Link previews**). With them on, typing a link makes this device read the page once for its preview, so the site sees your IP address. Those who receive the message fetch nothing.

## Maps

A received location opens in your maps app on Android, or on openstreetmap.org in the browser on desktop, only when you tap it. Unisend loads no map tiles itself.

## GitHub

Only when you tap an emoji font to download (Settings, Appearance, Emoji, on Android and Linux): GitHub sees your IP address and which font.

## Your other devices

Settings taken from another device through the server go end-to-end encrypted between two of your verified devices, so your homeserver sees only that they exchanged a message, when and how large. Over the local network no server takes part: the receiving device announces a random key and a port by broadcast to everyone on that network. See [Settings and devices](/docs/settings#moving-settings-to-another-device).

## Only in other builds

The release downloads have neither of these. They exist only in builds made with their own keys (see [Build from source](/docs/build)):

- **KLIPY**, with a KLIPY key, only when you open the GIF picker: your IP address, what you search for, the GIF you send and a random ID made once per app start.
- **An update host**, in Android builds made with `UNISEND_UPDATE_URL`: a plain request for `update.json` with no identifier, once a day or when you tap Check now.

## What other people see

Settings, Privacy and security, **Hide reading and typing** is on by default: others do not see that you have read their messages or that you are typing. **Send typing notifications** controls typing alone, for when read receipts are shown; hiding reading and typing turns it off too.
