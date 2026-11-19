<script>
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Reveals `.reveal` once, and keeps `.demo` marked `on` only while on screen, so idle demos stop. */
	/** @param {HTMLElement} node */
	const observe = (node) => {
		node.classList.add('motion-ready');
		const reveals = node.querySelectorAll('.reveal');
		const demos = node.querySelectorAll('.demo');
		if (!('IntersectionObserver' in window) || reduced()) {
			reveals.forEach((el) => el.classList.add('visible'));
			demos.forEach((el) => el.classList.add('on'));
			return;
		}
		const once = new IntersectionObserver((entries) => {
			for (const e of entries) if (e.isIntersecting) { e.target.classList.add('visible'); once.unobserve(e.target); }
		}, { threshold: 0.14 });
		const live = new IntersectionObserver((entries) => {
			for (const e of entries) e.target.classList.toggle('on', e.isIntersecting);
		}, { threshold: 0.2 });
		reveals.forEach((el) => once.observe(el));
		demos.forEach((el) => live.observe(el));
		return () => { once.disconnect(); live.disconnect(); };
	};

	/**
	 * Calls `fn` every `ms` while the node is on screen and the tab is visible; never with reduced motion.
	 * @param {() => void} fn @param {number} ms
	 */
	const every = (fn, ms) => (/** @type {HTMLElement} */ node) => {
		if (reduced()) return;
		let seen = false, timer = 0;
		const sync = () => {
			clearInterval(timer);
			timer = seen && !document.hidden ? setInterval(fn, ms) : 0;
		};
		const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); });
		io.observe(node);
		document.addEventListener('visibilitychange', sync);
		return () => { clearInterval(timer); io.disconnect(); document.removeEventListener('visibilitychange', sync); };
	};

	// The same synthetic chats as the app screenshots, drawn to the app's chat list.
	let chats = $state([
		{ id: 1, name: 'Maya Chen', text: 'A bit torn, but it will do', you: false, unread: 3, time: '10:35', hue: 310 },
		{ id: 2, name: 'Weekend hike', text: 'Jonas Weber: Lake, obviously', you: false, unread: 6, time: '10:35', hue: 150 },
		{ id: 3, name: 'Ana Ruiz', text: 'Yes, 10:30 at the usual place', you: true, unread: 0, time: '10:35', hue: 25 },
		{ id: 4, name: 'Daniel Park', text: 'The slides are in the shared folder', you: false, unread: 0, time: '10:35', hue: 205 },
		{ id: 5, name: 'Mom', text: "Call me when you're back", you: false, unread: 0, time: '10:35', hue: 12 },
		{ id: 6, name: 'Elif Kaya', text: 'Let me know how it turns out', you: true, unread: 0, time: '10:35', hue: 262 },
		{ id: 7, name: 'Climbing Tuesdays', text: 'Chris Novak: Gym is open until 10 tonight', you: false, unread: 0, time: '10:35', hue: 355 },
		{ id: 8, name: 'Jonas Weber', text: 'Great, see you there', you: false, unread: 0, time: '10:34', hue: 210 }
	]);
	const incoming = [
		[3, 'Lunch tomorrow?'], [2, 'Tom Becker: Forecast says sun until 3'], [7, 'Lena Ortiz: Who has the rope?'],
		[1, 'Sent a photo'], [5, 'Did you eat?'], [2, 'Priya Raman: Picnic it is'], [6, 'It worked!'], [3, 'Voice message'], [4, 'Thanks, got them']
	];
	let clock = 10 * 60 + 35; // minutes since midnight
	let step = 0;
	const arrive = () => {
		const [id, text] = incoming[step++ % incoming.length];
		const [chat] = chats.splice(chats.findIndex((c) => c.id === id), 1);
		clock = (clock + 1) % (24 * 60);
		const time = `${Math.floor(clock / 60)}:${String(clock % 60).padStart(2, '0')}`;
		Object.assign(chat, { text, time, you: false, unread: (chat.unread % 4) + 1 });
		chats.unshift(chat);
		for (const c of chats.slice(3)) c.unread = 0; // read on another device, so the counts stay few
	};
	const unread = $derived(chats.reduce((n, c) => n + c.unread, 0));

	// Lucide icons (ISC, see /LICENSE-LUCIDE.txt), the set the app draws with.
	const ICONS = {
		plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
		search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
		check: '<path d="M20 6 9 17l-5-5"/>',
		chats: '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
		archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
		networks: '<path d="m10.586 5.414-5.172 5.172"/><path d="m18.586 13.414-5.172 5.172"/><path d="M6 12h12"/><circle cx="12" cy="20" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="4" cy="12" r="2"/>',
		settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>',
		clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
	};

	const sees = [
		{ who: 'This device', what: 'Your messages, keys and settings. On Android the app\'s data is encrypted with a key held in the Android Keystore, and the app can lock with your phone\'s lock or a PIN.' },
		{ who: 'Your homeserver', what: 'What any Matrix server sees: your account, the rooms you are in, message metadata, your IP address and the content of unencrypted rooms. Encrypted rooms are end-to-end encrypted.' },
		{ who: 'Beeper bridges', what: 'Only with a Beeper account. A bridge has to read a message to pass it between Matrix and the other network, so it sees the content of bridged chats.' },
		{ who: 'The other network', what: 'WhatsApp, Messenger and the rest see what they always see. Nothing more comes from Unisend.' },
		{ who: 'Anyone else', what: 'Only for what you turn on or tap: a site you link, once, with link previews on; GIF search, in builds that include it; an emoji font you download; a location you open. Builds made with an update address ask it once a day for update.json, with no identifier.' }
	];
	let seen = $state(1);

	const extras = [
		['Voice messages', 'Recorded and played right in the chat, on Android and Linux.'],
		['Sent, even offline', 'Messages wait in a queue that survives losing signal and restarting the app.'],
		['Search on the device', 'One index across every chat, kept here, not on a server.'],
		['Locked when you want', "Your phone's lock or an app PIN. Screenshots blocked on Android."],
		['Encrypted, end to end', 'Verify a device by comparing emoji. History comes back with your recovery code.'],
		['Every network in one list', 'Sign in to each network from the app, and see when one needs you again.']
	];
	const platforms = [
		['Android', 'Main target, tested on a phone'],
		['Linux', 'Built and tested'],
		['macOS', 'In progress'],
		['Windows', 'Compiles, never run']
	];
</script>

<svelte:head>
	<title>Unisend | Every chat, one private app</title>
	<meta name="description" content="A Matrix chat client for Android and desktop. Any homeserver, or a Beeper account with its bridges to WhatsApp, Signal, Instagram and more. No telemetry, no Google services." />
	<meta property="og:title" content="Unisend | Every chat, one private app" />
	<meta property="og:description" content="A Matrix chat client for Android and desktop." />
</svelte:head>

{#snippet icon(/** @type {string} */ d)}<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">{@html d}</svg>{/snippet}

<div class="page" {@attach observe}>
	<a class="skip" href="#main">Skip to content</a>
	<header class="nav wrap">
		<a class="brand" href="#top" aria-label="Unisend, back to top"><img src="/icon.svg" alt="" width="28" height="28" />Unisend</a>
		<nav aria-label="Sections"><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
	</header>

	<main id="main">
		<section class="hero wrap" id="top">
			<div class="hero-copy">
				<h1>Every chat.<br />One private app.</h1>
				<p class="lead">A Matrix client for Android and desktop. With a Beeper account it also carries WhatsApp, Signal, Instagram, Messenger and the rest, in one list.</p>
				<div class="actions"><a class="button" href="#features">See what it does</a><a class="text-link" href="#privacy">Who sees what</a></div>
				<p class="note">No telemetry. No Google services. Built in Rust.</p>
			</div>
			<div class="stage">
				<div class="phone" data-ui role="img" aria-label="The Unisend chat list, where new messages arrive and move their chat to the top" {@attach every(arrive, 2600)}>
					<div class="app-bar"><b>Chats</b>{@render icon(ICONS.plus)}{@render icon(ICONS.search)}</div>
					<div class="chips"><span class="chip on">All</span><span class="chip">Unread <small>{unread}</small></span><span class="chip">Low priority</span></div>
					<ul class="rows">
						{#each chats as chat (chat.id)}
							<li class="row" class:unread={chat.unread} animate:flip={{ duration: 480, easing: cubicOut }}>
								<span class="avatar" style:--h={chat.hue}></span>
								<span class="row-text"><b>{chat.name}</b><span>{#if chat.you}{@render icon(ICONS.check)}You:{' '}{/if}{chat.text}</span></span>
								<span class="row-meta"><small>{chat.time}</small>{#if chat.unread}<em>{chat.unread}</em>{/if}</span>
							</li>
						{/each}
					</ul>
					<div class="app-tabs" aria-hidden="true">
						{#each [['Chats', ICONS.chats], ['Archive', ICONS.archive], ['Networks', ICONS.networks], ['Settings', ICONS.settings]] as [label, d], i (label)}
							<span class:on={i === 0}>{@render icon(d)}{label}</span>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section class="desktop wrap" aria-labelledby="desktop-title">
			<div class="head reveal">
				<h2 id="desktop-title">Phone or desktop, one app</h2>
				<p>Make the window wide and the chat list, the chat and its info sit side by side. Narrow it, and it is the phone app again.</p>
			</div>
			<img class="shot reveal" src="/shots/desktop.png" alt="Unisend on desktop: the chat list beside a group chat with a shared sunset, a reply, reactions and a poll" width="1280" height="800" loading="lazy" />
		</section>

		<section class="split wrap" id="features" aria-labelledby="talk-title">
			<div class="split-copy reveal">
				<h2 id="talk-title">Talk like you do everywhere</h2>
				<p>Replies, reactions, edits, polls, mentions and Markdown as you type. Photos, files and voice messages. Delete for everyone, or only for you.</p>
			</div>
			<div class="split-pic reveal"><img src="/shots/chat.png" alt="A group chat with a shared sunset, a reply, reactions and a poll" width="420" height="880" loading="lazy" /></div>
		</section>

		<section class="split flip wrap" aria-labelledby="look-title">
			<div class="split-copy reveal">
				<h2 id="look-title">Black, quiet, yours</h2>
				<p>Dark, light or system theme, nine chat colours, a wallpaper and five text sizes. In English and Polish.</p>
			</div>
			<div class="split-pic reveal"><img src="/shots/settings.png" alt="Appearance settings: theme, language, chat colour and text size" width="420" height="880" loading="lazy" /></div>
		</section>

		<section class="split wrap" aria-labelledby="notify-title">
			<div class="split-copy reveal">
				<h2 id="notify-title">Notifications that keep quiet</h2>
				<p>Choose what a notification shows. No push service either: on Android the app keeps its own connection to your homeserver.</p>
			</div>
			<div class="split-pic levels reveal" data-ui>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Maya Chen</b>See you at 8</span></span><figcaption>Name and message</figcaption></figure>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Maya Chen</b>New message</span></span><figcaption>Name only</figcaption></figure>
				<figure><span class="notif"><img src="/icon.svg" alt="" width="36" height="36" /><span><b>Unisend</b>New message</span></span><figcaption>Neither</figcaption></figure>
			</div>
		</section>

		<section class="extras wrap" aria-labelledby="extras-title">
			<h2 class="reveal" id="extras-title">And the rest of a good chat app</h2>
			<dl class="reveal">
				{#each extras as [title, text] (title)}<div><dt>{title}</dt><dd>{text}</dd></div>{/each}
			</dl>
		</section>

		<section class="privacy" id="privacy" aria-labelledby="privacy-title">
			<div class="wrap">
				<div class="head reveal">
					<h2 id="privacy-title">Who sees what</h2>
					<p>No telemetry, no crash reports, no Google services, no push servers. What does leave the device goes to as few parties as it can.</p>
				</div>
				<div class="sees reveal">
					<div class="parties" role="tablist" aria-label="Who sees what" aria-orientation="vertical">
						{#each sees as s, i (s.who)}
							<button role="tab" id="sees-{i}" aria-selected={seen === i} aria-controls="sees-panel" onclick={() => (seen = i)}>{s.who}</button>
						{/each}
					</div>
					<div class="sees-panel" id="sees-panel" role="tabpanel" aria-labelledby="sees-{seen}">
						{#key seen}<p in:fly={{ y: 8, duration: 240, easing: cubicOut }}>{sees[seen].what}</p>{/key}
					</div>
				</div>
			</div>
		</section>

		<section class="platforms wrap" id="platforms" aria-labelledby="platforms-title">
			<div class="head reveal">
				<h2 id="platforms-title">Where it runs</h2>
				<p>One Rust codebase. GPUI draws the interface and matrix-sdk talks to Matrix on its own thread, so the screen never waits on the network.</p>
			</div>
			<table class="reveal">
				<tbody>{#each platforms as [os, state] (os)}<tr><th scope="row">{os}</th><td>{state}</td></tr>{/each}</tbody>
			</table>
		</section>

		<section class="closing wrap" aria-labelledby="closing-title">
			<img class="reveal" src="/icon.svg" alt="" width="112" height="112" loading="lazy" />
			<h2 class="reveal" id="closing-title">Keep your account.<br />Choose your client.</h2>
			<a class="button reveal" href="#top">Back to top</a>
		</section>
	</main>

	<footer class="footer wrap"><span>Unisend. No trackers on this page either.</span><a href="/LICENSE-LUCIDE.txt">Icons: Lucide, ISC licence</a></footer>
</div>
