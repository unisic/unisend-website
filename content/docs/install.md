---
title: "Install"
description: "Download Unisend for Android, Linux, macOS or Windows, and what each platform asks of you the first time."
order: 2
group: "Getting started"
---

## Downloads

Every release is on [GitHub](https://github.com/unisic/unisend/releases/latest). For 0.1.1:

| Platform | File |
|---|---|
| Android 8.0 or newer (arm64) | `Unisend-0.1.1.apk` |
| Linux x86_64 | `Unisend-0.1.1-x86_64.AppImage` |
| macOS 11 or newer (Apple silicon and Intel) | `Unisend-0.1.1-macos-universal.zip` |
| Windows x64 | `Unisend-0.1.1-windows-x64.zip` |

`SHA256SUMS` on the same page lists the checksum of each file. To check a download, run this in the folder that holds both:

```sh
sha256sum --ignore-missing -c SHA256SUMS
```

## Android

1. Download the APK on the phone and open it.
2. Android asks whether the browser or file manager you opened it from may install apps. Allow it for that app.
3. Install, then open Unisend.

The APK is signed with the same release key as 0.1.0, so it installs over 0.1.0 and keeps your data. The key's certificate SHA-256 is:

```
c0:fc:54:dc:20:8d:d1:ee:cd:3d:c9:66:47:ae:f2:d2:99:23:26:d0:8e:35:1f:d0:a9:dd:a8:2f:19:29:a8:1b
```

> [!NOTE]
> The release APK has no update checks and no GIF picker. Both exist only in builds made with their own keys: see [Build from source](/docs/build).

## Linux

The AppImage needs glibc 2.39 or newer. It uses the system's GTK 3, WebKitGTK 4.1 and GStreamer, so those come from your distribution.

```sh
chmod +x Unisend-0.1.1-x86_64.AppImage
./Unisend-0.1.1-x86_64.AppImage
```

What each library is for:

- **GStreamer** plays and records voice messages in the chat. Without its base and good plugins, audio opens in the system's player and there is no microphone button.
- **WebKitGTK 4.1** shows a network's login page in a window of the app's own, for networks that sign in with cookies. Without it the page opens in your browser and you paste the result.
- **ffmpeg** is optional. With it on `PATH`, a video a network refuses can be made into an MP4 before sending.

## macOS

Unzip the file and move Unisend to Applications. The app is signed ad hoc and not notarized, so the first time open it from Finder with right-click, Open.

Notifications only arrive from the app bundle, not from a binary started in a terminal.

## Windows

Unzip the file and run the program inside. It is unsigned, so SmartScreen warns before the first start.

> [!WARNING]
> The Windows build has never been run by anyone working on Unisend. It compiles; whether it works is unknown.

## Where your data lives

| Platform | Folder |
|---|---|
| Linux | `~/.local/share/beeper-gpui` |
| macOS | `~/Library/Application Support/beeper-gpui` |
| Windows | `%LOCALAPPDATA%\beeper-gpui` |
| Android | the app's private storage, encrypted: see [Data on your device](/docs/data) |
