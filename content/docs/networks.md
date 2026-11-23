---
title: "Networks and bridges"
description: "Signing in to WhatsApp, Signal, Messenger and other networks through a Beeper account, and what bridges cannot carry."
order: 4
group: "Getting started"
---

## How other networks get in

Matrix has bridges: services that pass messages between a Matrix room and a chat on another network. A Beeper account comes with Beeper's bridges, so chats from WhatsApp, Signal, Messenger, Instagram, Telegram and others show up in Unisend's chat list beside your Matrix chats.

Networks are a Beeper feature. With an account on another Matrix server, the **Networks** tab says so and offers nothing to sign in to.

## Signing in to a network

With a Beeper account, the **Networks** tab lists your chat networks and lets you sign in to more. A network you sign in to is added to your Beeper account itself, so every Beeper app you use gets it, not only Unisend.

Some networks sign in on their own login page. On Android and Linux it opens in a window of the app's own, which keeps its cookies and storage in memory only and hands them to the bridge. Location, camera, microphone and notification requests from the page are refused. On macOS and Windows, or on Linux without WebKitGTK, the page opens in your browser and you paste the result back into the app.

When a network needs you to sign in again, Unisend says "Some networks need you to sign in again." A tap on that notice opens the **Networks** tab.

### Messenger's PIN

Messenger keeps encrypted history behind a 6-digit PIN. When the bridge asks for it, Unisend asks you, and the history unlocks.

## What a bridge sees

A bridge has to read a message to pass it between Matrix and the other network, so Beeper's bridges see the content of bridged chats, and the other network (WhatsApp, Messenger and so on) sees what it always sees. The full list of who sees what is on [What leaves your device](/docs/privacy).

## What bridges cannot carry

Some things do not exist on the Matrix side, or no bridge passes them on:

- **Calls**: bridges carry messages, not voice or video streams.
- **View-once media**: Matrix has no standard event for it; a bridge delivers a normal file. Unisend refuses to forward such a message.
- **Stories and status**.
- **Live location**: there is no stable Matrix event for it. Sending your current location works where the bridge supports it.
- **Messenger chat themes and nicknames**.
- **Backups** from WhatsApp, Signal or Meta's clouds.
- **Threads** on bridged networks: only rooms that live on Matrix have real threads, and Unisend does not show threads yet.

Other features depend on the bridge: editing, deleting for everyone, reactions, polls, disappearing messages and contact cards work on a bridged chat only where that bridge supports them. Edit and delete follow the limits of the chat's network.
