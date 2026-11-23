---
title: "Notifications"
description: "How notifications reach you without a push service, what they show, their sounds, and quiet hours with notification profiles."
order: 6
group: "Using Unisend"
---

## Without a push service

Unisend uses no push service, Google's or anyone else's. On Android it keeps its own connection to your homeserver in the background instead.

Settings, Notifications, **Stay connected in the background**:

- **On**: notifications arrive while Unisend is closed, under a quiet system notice. **Hide the connection notice** opens Android's settings for that notice alone; messages keep arriving.
- **Off**: no notice, and messages arrive only while Unisend is open.

On the desktop, **Keep running when the window is closed** does the same job. On, messages and notifications keep arriving after you close the window, and on Linux a tray icon gets a dot while a chat waits. Off, closing the window quits. Windows has no tray icon, so there closing the window always quits.

## What a notification shows

Settings, Notifications, **Show**: the sender's name and the message, the name only, or neither.

On Android each chat gets one notification, with **Reply** and **Mark as read**. Per platform:

| Platform | Actions |
|---|---|
| Android | Reply, mark as read |
| Linux | Reply, mark as read, mute. The reply box comes from the desktop's notification server; KDE Plasma has one. |
| macOS | Buttons, but no reply box, picture or sound |
| Windows | Reply box; its buttons answer only while Unisend runs |

With the [app lock](/docs/app-lock) on, a desktop notification names only the chat ("New message") and has no buttons until you unlock. On Android, what the lock screen shows is up to Android's own lock-screen notification settings.

## Sounds

Settings, Notifications, **Sounds**: six short tones of Unisend's own (Dew, Pebble, Chime, Ripple, Bloom, Pop), or none, chosen apart for direct messages, group chats and mentions. Tap a sound to hear it.

**Add your own sound** takes any audio file up to 1 MB, at most 16 of them.

Sounds are chosen in the app on Android and Linux. On macOS and Windows notifications keep the system's sound. On Android, **Importance and vibration** opens the system's settings for each of the three kinds.

> [!NOTE]
> Android fixes a notification channel's sound when the channel is made, so changing a tone in Unisend makes a new channel. Importance and vibration set in Android's settings move over to it.

## One chat

A chat's info screen has its own notification settings: **Sound and vibration** on or off, **Mentions while muted** (in a group: always notify me, or don't), and which notification profiles let the chat through. Muting a chat, for a set time or always, is separate: see [Chats and messages](/docs/chats#the-chat-list).

## Notification profiles

Settings, Notifications, **Notification profiles**: while a profile is on, only the chats it lets through notify; the rest arrive quietly. A profile has a name, the chats that come through, whether every mention comes through, and a schedule. A profile can also be turned on by hand, for 1 hour or until you turn it off. Profiles stay on this device.
