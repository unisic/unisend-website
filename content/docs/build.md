---
title: "Build from source"
description: "Building Unisend yourself for Linux or Android, and the build-time keys that add the GIF picker and update checks."
order: 12
group: "Reference"
---

The source is at [github.com/unisic/unisend](https://github.com/unisic/unisend). The app is Rust; there is some Java under `android/` only where Android accepts nothing else. The crate and binary are named `beeper-gpui`.

## Linux

Needs a stable Rust toolchain and the development packages for xcb, xkbcommon (with x11), fontconfig, freetype, wayland and GStreamer (`gstreamer1-devel` on Fedora, `libgstreamer1.0-dev` on Debian and Ubuntu).

```sh
cargo build --release
packaging/linux/install.sh
```

This puts the binary in `~/.local/bin` and the launcher and icons in `~/.local/share`. Run both again to update.

Or pack one AppImage, which uses the system's GTK, WebKitGTK and GStreamer (needs `appimagetool`):

```sh
packaging/linux/appimage.sh target/release Unisend-x86_64.AppImage
```

The window for signing in to networks is a separate program, `beeper-gpui-weblogin`, built only with WebKitGTK 4.1 (2.40 or later) and GTK 3 development files: `webkit2gtk4.1-devel` and `gtk3-devel` on Fedora, `libwebkit2gtk-4.1-dev` and `libgtk-3-dev` on Debian and Ubuntu. The app starts without it.

### Fedora without libxkbcommon-x11-devel

The linker needs the unversioned `libxkbcommon-x11.so`. Without root:

```sh
mkdir -p target/linkshim
ln -sf /usr/lib64/libxkbcommon-x11.so.0 target/linkshim/libxkbcommon-x11.so
RUSTFLAGS="-L $PWD/target/linkshim" cargo build --release
```

## Android

Needs the Android SDK and NDK (`ANDROID_NDK_HOME`), `cargo-ndk` and the `aarch64-linux-android` Rust target. Android 8.0 (API 26) or newer.

```sh
cargo ndk -t arm64-v8a -P 26 -o android/app/src/main/jniLibs build --release --lib
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

A debug APK is signed with a debug key, so it will not install over the release APK. Uninstalling the release app first deletes its data on the phone.

## macOS and Windows

macOS needs Xcode's command line tools:

```sh
cargo build --release
sh packaging/macos/bundle.sh target/release/beeper-gpui target/macos
```

Windows builds on a Windows host only, where GPUI compiles its shaders with `fxc.exe` from the Windows SDK:

```sh
cargo build --release --locked --bin beeper-gpui --target x86_64-pc-windows-msvc
```

## Build-time keys

Two features are read at build time and are absent from the release downloads:

- `KLIPY_API_KEY` adds the GIF picker, which talks to KLIPY.
- `UNISEND_UPDATE_URL` (Android) adds update checks against an `update.json` at that address.

What each one sends is on [What leaves your device](/docs/privacy#only-in-other-builds). The details are in `docs/development.md` in the app's repository.
