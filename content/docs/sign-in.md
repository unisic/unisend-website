---
title: "Sign in"
description: "Signing in to a Matrix server or to Beeper, making a new account, and unlocking encrypted history on a new device."
order: 3
group: "Getting started"
---

The first screen offers two ways in: **Sign in with Matrix** for any Matrix server, and **Sign in with Beeper** for a Beeper account.

## A Matrix server

1. Choose **Sign in with Matrix** and type your server, such as `matrix.org`.
2. Unisend asks the server how it signs people in and offers what it supports:
   - **Continue in the browser**: the server's own page, through OAuth 2.0 or single sign-on. Finish there; the app goes on by itself.
   - **User name and password**, on servers that still take them.

A server that signs people in only some other way gets the message "This server signs people in another way, which this app does not support yet."

## Beeper

1. Choose **Sign in with Beeper** and type the email address of your Beeper account.
2. Beeper emails you a sign-in code. Type it in.

Your WhatsApp, Signal and other chats then come in through Beeper's bridges. Signing in to the networks themselves is on [Networks and bridges](/docs/networks).

## A new account

**Create an account** lists Matrix servers that take new people. How the account is made depends on the server:

- Servers with OAuth sign-up, such as matrix.org and tchncs.de, make it inside the app.
- Servers that ask only for an invite code, such as reszka.org, also make it inside the app. The people who run the server give out the codes.
- The rest open their own sign-up page. Once you have the account, sign in with it here.

Beeper accounts are made in Beeper's own app. Choosing Beeper opens its download page; afterwards, sign in here with the code from your email.

## Encrypted history on a new device

A new sign-in cannot read messages that were encrypted before it existed. When a chat holds such messages, it shows "Some messages could not be decrypted. Unlock encrypted history". There are two ways to unlock it:

- **Your recovery code**: 48 letters and digits in groups of four, as Beeper, Element or Unisend showed it when it was made.
- **Another device**: in Settings, Devices, verify this device from one where you are already signed in, by checking that both show the same emoji.

If the account has never set up key storage, set it up in Beeper or Element first, then verify this device in Unisend.

> [!TIP]
> On a device that holds the code, Settings, Devices, Recovery code, **Show** displays it, to copy to another device. **New code** in the same place makes a new one; the old code then stops working in every app, Beeper too.

## Sign out

Settings, Account, **Sign out**. Unisend deletes this device's copy of your chats, keys and session (see [Data on your device](/docs/data)). The account and its messages stay on the server; after signing in again, encrypted history comes back with your recovery code or another device.
