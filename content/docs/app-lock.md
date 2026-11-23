---
title: "App lock"
description: "Locking Unisend with the phone's lock or a PIN of its own, what happens after wrong tries, and what the lock does not protect."
order: 10
group: "Privacy and security"
---

Settings, Privacy and security, **App lock**: Off, Phone lock (Android only) or App PIN.

## Phone lock

Android only. Unisend asks for the phone's own lock: fingerprint, face, or the phone's PIN, pattern or password. The phone needs a PIN, pattern or password set in its settings first.

Choosing Phone lock asks for the phone's lock once straight away, so a lock you cannot pass is never switched on. If the phone's lock is removed later, Unisend opens without asking.

## App PIN

4 to 8 digits, set only for Unisend. Only a salted hash of the PIN is kept on the device (PBKDF2-HMAC-SHA256, 600 000 iterations), never the PIN itself.

After wrong tries:

| Try | Wait |
|---|---|
| 1st to 4th | none |
| 5th | 30 seconds |
| each one after | double the last, up to an hour |

The count is kept on disk, so closing or killing the app does not reset it.

Changing the PIN or leaving App PIN asks for the current PIN; leaving Phone lock asks for the phone's lock.

> [!WARNING]
> A forgotten PIN cannot be recovered. The only way back in is to clear the app's storage, which signs you out. Your messages stay on the server, and encrypted history comes back with your recovery code.

## When it locks

On Android, **Auto-lock** chooses when: immediately, or after 1, 5 or 30 minutes away.

On the desktop the lock is the app PIN only. It is asked at start, and again when a window opens after the last one closed: with Unisend running on in the background, closing the window counts as leaving the app.

Signing out, or being signed out by the server, removes the PIN and turns the lock off.

## What it protects against

Someone holding your unlocked phone or computer and opening Unisend.

It does not encrypt anything. Messages, keys and the session are as readable as before to anyone who can read the app's files, and a 4 to 8 digit PIN is quickly guessed offline whatever the hash. How the files themselves are kept is on [Data on your device](/docs/data).

On Android, notifications still show senders and message text while the app is locked; to hide them, use Settings, Notifications, **Show**, or Android's own lock-screen notification settings. On the desktop, a notification while locked names only the chat and has no buttons.

## Screen security

Android only. Settings, Privacy and security, **Screen security** blocks screenshots of Unisend and hides it in the recent apps list.
