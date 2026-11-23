---
title: "Data on your device"
description: "What Unisend stores, how Android keeps it encrypted, what that protects against, and what stays plain on the desktop."
order: 11
group: "Privacy and security"
---

## Android: encrypted

On Android, everything that holds chat content is encrypted on the device with a random key made for each sign-in. That key is itself encrypted by a key in the Android Keystore, which never leaves the phone's secure hardware (StrongBox where the phone has it, the TEE otherwise).

Encrypted:

- matrix-sdk's databases: messages, rooms, members, encryption keys and cached media
- your session (access token and device)
- the chat list with names and message previews
- drafts
- nicknames and notes you gave people
- the search index

Not encrypted, because they hold no chat content: settings, recent emoji, the IDs of messages you deleted for yourself, wallpapers, notification sounds, the app PIN's hash and the emoji font.

Android backup is off and every file is excluded from cloud backup and from transfer to a new phone.

### What it protects against

The app's files copied off the phone, by root access or a forensic tool: without the phone's Keystore they are random bytes.

It does not protect against:

- root access or malware running as Unisend on the live phone. The Keystore key works for anything running as the app, and the app holds its key in memory while it runs.
- a copy taken while the phone is on. The key needs neither the screen unlocked nor your credential, so that the background connection works on a locked phone.

### Short-lived plain files

Some files have to be plain for a moment: an attachment opened in another app or played (deleted 10 minutes after download), a chat picture for a notification, your own recordings, photos and picked files on their way out, and pasted or edited pictures waiting to send. Each is deleted once used, and leftovers at the next start. A copy saved to the gallery (`Pictures/Unisend`) is a public copy you asked for.

### Older installs

An Android install signed in before Unisend encrypted its data keeps working unencrypted, and Settings, Privacy and security says "Data on this device is not encrypted". Sign out and in again to encrypt it; keep your recovery code to bring back message history.

## Desktop: plain

On Linux, macOS and Windows the store and files are plain on disk: no hardware key store is wired up yet. Anyone who can read your user's files can read Unisend's. Full-disk encryption is what protects them when the computer is off.

| Platform | Folder |
|---|---|
| Linux | `~/.local/share/beeper-gpui` |
| macOS | `~/Library/Application Support/beeper-gpui` |
| Windows | `%LOCALAPPDATA%\beeper-gpui` |

## Limits on what is kept

- **Media cache**: at most 400 MiB, at most 20 MiB a file. Media not opened for 60 days, or for the shorter time **Keep messages** sets, is removed by a daily cleanup. Settings, Data and storage, **Clear media cache** empties it; the media downloads again when shown.
- **Search index**: at most 50 000 messages and 24 MiB, the oldest pruned first.

## Signing out

Signing out, or the server signing this device out, deletes the store, the key, the session, the chat list, drafts, the search index, downloads and notification pictures from this device. Nothing on the server is deleted.

If the Keystore key is lost for good, Unisend signs out and says so; your files stay until the next sign-in. Anything that may pass, such as a busy Keystore, is retried and deletes nothing.
