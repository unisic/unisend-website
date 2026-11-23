---
title: "On the desktop"
description: "The desktop layout, running on with the window closed, keyboard shortcuts, and how Linux, macOS and Windows differ."
order: 7
group: "Using Unisend"
---

## Layout

A wide window shows the chat list and the open chat side by side, with a chat's info in a panel beside them. Below 720 px wide, Unisend switches to the phone layout.

Typing goes straight into the open chat's message field, without clicking it first. Files can be dragged into a chat or pasted.

On Linux, Unisend draws its own title bar and window buttons where the compositor allows it; a compositor that insists on its own title bar wins.

## Keyboard shortcuts

Ctrl on Linux and Windows is Command on macOS; Alt is Option. Settings, Chats, **Keyboard shortcuts**, or Ctrl+/, shows the same list in the app.

| Keys | Action |
|---|---|
| Ctrl+K or Ctrl+F | Search chats |
| Ctrl+Shift+F | Search this chat |
| Ctrl+N | New chat |
| Ctrl+, | Settings |
| Alt+Up, Alt+Down | Previous or next chat |
| Alt+Shift+Up, Alt+Shift+Down | Previous or next unread chat |
| Ctrl+Shift+J | Emoji picker |
| Ctrl+Shift+A | Archive or unarchive the chat |
| Ctrl+Shift+U | Mark the chat as unread or read |
| Ctrl+V | Paste files |
| Up | Edit your last message |
| Esc | Go back |
| Ctrl+/ | Keyboard shortcuts |

## Running with the window closed

With **Keep running when the window is closed** on (Settings, Notifications), closing the window leaves Unisend running, so messages and notifications keep arriving.

- **Linux**: a tray icon stays, and gets a dot while a chat waits. Open Unisend again from the tray or by launching it.
- **macOS**: a click on the Dock icon opens the window again.
- **Windows**: there is no tray icon, so closing the window quits.

Starting Unisend a second time on Linux or macOS raises the copy that already runs. On Windows the second start ends without raising the first.

## Platform differences

| | Linux | macOS | Windows |
|---|---|---|---|
| State | tested | builds and runs, little tested | builds, never run |
| Voice messages | recorded and played in the chat | open in the system's player | open in the system's player |
| Network sign-in page | the app's own window (WebKitGTK) | your browser, then paste | your browser, then paste |
| Notifications | reply, mark as read, mute | buttons, no reply box | reply box |
| App lock | app PIN | app PIN | app PIN |
| Data on disk | plain | plain | plain |

"Plain" means the desktop builds do not encrypt their files yet: see [Data on your device](/docs/data).
