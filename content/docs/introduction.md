---
title: "Introduction"
description: "What Unisend is, the accounts it signs in to, where it runs, and what this documentation covers."
order: 1
group: "Getting started"
---

## What Unisend is

Unisend is a Matrix chat client for Android and the Linux desktop. It works with any Matrix homeserver, and with Beeper accounts, whose bridges bring WhatsApp, Signal, Messenger, Instagram, Telegram and other networks into the same chat list.

It is written in Rust. [GPUI](https://www.gpui.rs) draws the interface and matrix-sdk talks to Matrix. The source is on GitHub at [unisic/unisend](https://github.com/unisic/unisend).

These pages describe version 0.1.2, the latest release.

## Where it runs

| Platform | State |
|---|---|
| Android 8.0 or newer (arm64) | The main target, built and tested on a phone |
| Linux x86_64 | Built and tested |
| macOS 11 or newer | In progress: the app builds and runs on Apple silicon, the release download has had little testing |
| Windows x64 | Builds, has never been run |

There is no app store listing. Every build is a file on the [releases page](https://github.com/unisic/unisend/releases/latest): see [Install](/docs/install).

## What it does not have

- Google services, telemetry, crash reporting and a push service. On Android, Unisend keeps its own connection to your homeserver for notifications: see [Notifications](/docs/notifications).
- Calls, view-once media, stories and live location. Bridges cannot carry them: see [Networks and bridges](/docs/networks#what-bridges-cannot-carry).

## Names you may see

The app is called Unisend, but the program and its data folder are still named `beeper-gpui`, and the Android app id is `dev.gpui.beeper`.
