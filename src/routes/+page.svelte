<script>
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// The two halves of the app icon's U, in its 108-unit canvas.
	const LEFT = 'M27.764,30.956L27.764,73.292Q27.764,81.524 24.236,85.64Q31.292,82.7 38.348,82.7L53.342,82.7L53.342,67.239A12.348,12.348 0 0 1 43.052,55.064L43.052,30.956A7.644,7.644 0 0 0 27.764,30.956Z';
	const RIGHT = 'M57.458,82.623A27.636,27.636 0 0 0 83.036,55.064L83.036,30.956A7.644,7.644 0 0 0 67.748,30.956L67.748,55.064A12.348,12.348 0 0 1 57.458,67.239Z';

	const networks = [
		{ name: 'WhatsApp', color: '#25d366' },
		{ name: 'Signal', color: '#3a76f0' },
		{ name: 'Instagram', color: '#e4405f' },
		{ name: 'Messenger', color: '#0a7cff' },
		{ name: 'Telegram', color: '#2aabee' },
		{ name: 'Discord', color: '#5865f2' },
		{ name: 'Matrix', color: '#ffffff' }
	];

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

	let word = $state(0);
	const nextWord = () => (word = (word + 1) % networks.length);

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
		settings: '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/>'
	};

	/** Moves a tile's light to the pointer. @param {PointerEvent} e */
	const glow = (e) => {
		const tile = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('.tile'));
		if (!tile) return;
		const r = tile.getBoundingClientRect();
		tile.style.setProperty('--x', `${e.clientX - r.left}px`);
		tile.style.setProperty('--y', `${e.clientY - r.top}px`);
	};

	const sees = [
		{ who: 'This device', what: 'Your messages, keys and settings. On Android the app\'s data is encrypted with a key held in the Android Keystore, and the app can lock with your phone\'s lock or a PIN.' },
		{ who: 'Your homeserver', what: 'What any Matrix server sees: your account, the rooms you are in, message metadata, your IP address and the content of unencrypted rooms. Encrypted rooms are end-to-end encrypted.' },
		{ who: 'Beeper bridges', what: 'Only with a Beeper account. A bridge has to read a message to pass it between Matrix and the other network, so it sees the content of bridged chats.' },
		{ who: 'The other network', what: 'WhatsApp, Messenger and the rest see what they always see. Nothing more comes from Unisend.' },
		{ who: 'Anyone else', what: 'Only for what you turn on or tap: a site you link, once, with link previews on; GIF search, in builds that include it; an emoji font you download; a location you open. Builds made with an update address ask it once a day for update.json, with no identifier.' }
	];
	let seen = $state(1);
	const pin = [0, 1, 2, 3];
	const wave = [6, 10, 16, 9, 22, 14, 26, 18, 12, 20, 28, 16, 10, 22, 14, 8, 18, 24, 12, 16, 8, 12, 20, 10, 6, 14, 9, 5];
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
	<header class="nav">
		<div class="wrap nav-inner">
			<a class="brand" href="#top" aria-label="Unisend, back to top"><img src="/icon.svg" alt="" width="32" height="32" /><span>Unisend</span></a>
			<nav class="nav-links" aria-label="Sections"><a href="#story">The U</a><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
		</div>
	</header>

	<main id="main">
		<section class="hero" id="top">
			<div class="aurora" aria-hidden="true"><span></span><span></span></div>
			<div class="wrap hero-top">
				<div class="hero-copy">
					<p class="pill"><span class="pulse" aria-hidden="true"></span>Matrix client for Android and desktop</p>
					<h1>
						Your
						<span class="swap" {@attach every(nextWord, 2200)}>
							{#key word}
								<span class="word" style:color={networks[word].color} in:fly={{ y: '100%', duration: 450, easing: cubicOut }} out:fly={{ y: '-50%', duration: 220 }}>{networks[word].name}</span>
							{/key}
						</span>
						lives here now.
					</h1>
					<p class="sr-only">Unisend brings WhatsApp, Signal, Instagram, Messenger, Telegram, Discord and Matrix chats into one app.</p>
					<p class="lede">One inbox for Matrix and, with a Beeper account, for every network its bridges reach. Built in Rust, private by default.</p>
					<div class="hero-actions"><a class="button button-primary" href="#features">See what it does</a><a class="button button-secondary" href="#privacy">Who sees what</a></div>
				</div>

				<div class="phone" aria-label="The Unisend chat list, where new messages arrive and move their chat to the top" role="img" {@attach every(arrive, 2600)}>
					<div class="phone-screen">
						<div class="phone-bar"><b>Chats</b>{@render icon(ICONS.plus)}{@render icon(ICONS.search)}</div>
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
						<div class="tabs" aria-hidden="true">
							{#each [['Chats', ICONS.chats], ['Archive', ICONS.archive], ['Networks', ICONS.networks], ['Settings', ICONS.settings]] as [label, d], i (label)}
								<span class:on={i === 0}>{@render icon(d)}{label}</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="wide-view" aria-label="Unisend on desktop">
			<div class="wrap">
				<figure class="window reveal">
					<img src="/shots/desktop.png" alt="Unisend on desktop: the chat list beside a group chat with a reply, reactions and a poll" width="1280" height="800" loading="lazy" />
				</figure>
				<p class="wide-caption reveal">Make the window wide and the chat list, the chat and its info sit side by side. Narrow it, and it is the phone app again.</p>
			</div>
		</section>

		<section class="section story" id="story">
			<div class="wrap story-inner reveal">
				<svg class="story-mark" viewBox="18 22 72 68" aria-hidden="true">
					<defs>
						<linearGradient id="story-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a874ff" /><stop offset="1" stop-color="#7446d0" /></linearGradient>
						<linearGradient id="story-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#c9c6d0" /></linearGradient>
					</defs>
					<path class="half half-l" d={LEFT} fill="url(#story-l)" />
					<path class="half half-r" d={RIGHT} fill="url(#story-r)" />
				</svg>
				<div class="story-copy">
					<p class="eyebrow">Why a U</p>
					<h2><span class="uni">Uni</span> + <span class="send">send</span>.</h2>
					<p class="section-lede">Two halves of a speech bubble: the left one keeps the tail, the right one is round. A thin gap keeps them two pieces, and together they close into one letter.</p>
				</div>
			</div>
		</section>

		<section class="section" id="features">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">What it does</p><h2>All the chat things.<br />None of the tracking.</h2></div>
				<div class="bento" role="presentation" onpointermove={glow}>
					<article class="tile wide demo reveal">
						<div class="mini-chat" aria-hidden="true">
							<div class="bubble in"><small>Priya</small>Lunch at the hut or a picnic by the lake?
								<span class="poll"><span class="opt" style:--v="33%"><b>Lunch at the hut</b><i>1</i></span><span class="opt" style:--v="67%"><b>Picnic by the lake</b><i>2</i></span></span>
							</div>
							<div class="bubble out"><span class="quote">Priya: Picnic by the lake</span>Picnic, obviously. I'll bring snacks<span class="react">❤️ 3</span></div>
						</div>
						<h3>Talk like you do everywhere</h3>
						<p>Replies, reactions, edits, polls, mentions and Markdown as you type. Delete for everyone or only for you.</p>
					</article>
					<article class="tile demo reveal">
						<div class="voice" aria-hidden="true"><span class="play"></span>{#each wave as h, i (i)}<i style:--h="{h}px" style:--d="{i * 70}ms"></i>{/each}</div>
						<h3>Voice messages</h3>
						<p>Recorded and played right in the chat, on Android and Linux.</p>
					</article>
					<article class="tile demo reveal">
						<div class="queue" aria-hidden="true"><span class="bubble out">On my way<span class="tick"><svg class="clock" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" /><path d="M8 4.5V8l2.5 1.5" /></svg><svg class="check" viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" /></svg></span></span><span class="signal">Offline</span></div>
						<h3>Offline? Still sent.</h3>
						<p>Messages wait in a queue that survives losing signal and restarting the app.</p>
					</article>
					<article class="tile demo reveal">
						<div class="search" aria-hidden="true"><span class="field"><span class="typed">hike</span></span><span class="hit"><b>Weekend hike</b> lake, obviously</span><span class="hit"><b>Tom</b> the hike starts at 8</span></div>
						<h3>Search on the device</h3>
						<p>One index across every chat, kept here, not on a server.</p>
					</article>
					<article class="tile demo reveal">
						<div class="lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg><span class="dots">{#each pin as p (p)}<i style:--d="{p * 350}ms"></i>{/each}</span></div>
						<h3>Locked when you want</h3>
						<p>Your phone's lock or an app PIN. Screenshots blocked on Android.</p>
					</article>
					<article class="tile wide reveal">
						<div class="nets" aria-hidden="true">{#each networks as n (n.name)}<span style:--c={n.color}>{n.name}</span>{/each}<span class="more">and more</span></div>
						<h3>Every network in one list</h3>
						<p>Any Matrix homeserver, plus the networks a Beeper account bridges. Sign in to each from the app, and see when one needs you again.</p>
					</article>
					<article class="tile wide demo reveal">
						<div class="notes" aria-hidden="true">
							<span class="note n1"><b>Maya Chen</b>See you at 8</span>
							<span class="note n2"><b>Maya Chen</b>New message</span>
							<span class="note n3"><b>Unisend</b>New message</span>
						</div>
						<h3>Notifications that keep quiet</h3>
						<p>Name and message, name only, or neither. No push service: Android keeps its own connection.</p>
					</article>
					<article class="tile wide demo reveal">
						<div class="verify" aria-hidden="true">{#each ['🐶', '🔑', '🚀', '🌵', '🎸', '🍕', '🐙'] as e, i (e)}<span style:--d="{i * 90}ms">{e}</span>{/each}</div>
						<h3>Encrypted, end to end</h3>
						<p>Verify a device by comparing emoji. History comes back with your recovery code.</p>
					</article>
				</div>
			</div>
		</section>

		<section class="section screens" aria-label="Screens from the Android app">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">The real thing</p><h2>Black, quiet, yours.</h2><p class="section-lede">Dark, light or system theme, nine chat colours, a wallpaper, five text sizes, English and Polish.</p></div>
				<div class="fan reveal">
					<img src="/shots/chat-list.png" alt="Chat list with unread counts" width="420" height="880" loading="lazy" />
					<img src="/shots/chat.png" alt="A group chat with a poll" width="420" height="880" loading="lazy" />
					<img src="/shots/settings.png" alt="Appearance settings: theme, language, chat colour, text size" width="420" height="880" loading="lazy" />
				</div>
			</div>
		</section>

		<section class="section" id="privacy">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">Privacy first</p><h2>Less sent.<br />To fewer parties.</h2></div>
				<div class="zeros reveal">
					<div><b>0</b><span>telemetry</span></div>
					<div><b>0</b><span>crash reports</span></div>
					<div><b>0</b><span>Google services</span></div>
					<div><b>0</b><span>push servers</span></div>
				</div>
				<div class="sees reveal">
					<div class="path" role="tablist" aria-label="Who sees what">
						{#each sees as s, i (s.who)}
							<button role="tab" id="sees-{i}" aria-selected={seen === i} aria-controls="sees-panel" class:on={seen === i} onclick={() => (seen = i)}><span class="node"></span>{s.who}</button>
						{/each}
					</div>
					<div class="sees-panel" id="sees-panel" role="tabpanel" aria-labelledby="sees-{seen}">
						{#key seen}<p in:fly={{ y: 10, duration: 260, easing: cubicOut }}><b>{sees[seen].who}</b>{sees[seen].what}</p>{/key}
					</div>
				</div>
			</div>
		</section>

		<section class="section" id="platforms">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">Where it runs</p><h2>One codebase.<br />Rust underneath.</h2><p class="section-lede">GPUI draws the interface, matrix-sdk speaks Matrix on its own thread, so the screen never waits on the network.</p></div>
				<div class="platforms reveal">
					<div class="platform"><b>Android</b><span class="ok">Main target</span></div>
					<div class="platform"><b>Linux</b><span class="ok">Tested</span></div>
					<div class="platform"><b>macOS</b><span>In progress</span></div>
					<div class="platform"><b>Windows</b><span>Compiles, never run</span></div>
				</div>
			</div>
		</section>

		<section class="closing">
			<div class="wrap reveal">
				<svg class="closing-mark" viewBox="0 0 108 108" aria-hidden="true">
					<defs>
						<linearGradient id="close-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1840" /><stop offset="1" stop-color="#120a1c" /></linearGradient>
						<linearGradient id="close-l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a874ff" /><stop offset="1" stop-color="#7446d0" /></linearGradient>
						<linearGradient id="close-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" /><stop offset="1" stop-color="#c9c6d0" /></linearGradient>
					</defs>
					<rect width="108" height="108" rx="24" fill="url(#close-t)" />
					<rect x=".5" y=".5" width="107" height="107" rx="23.5" fill="none" stroke="#fff" stroke-opacity=".14" />
					<path class="half half-l" d={LEFT} fill="url(#close-l)" />
					<path class="half half-r" d={RIGHT} fill="url(#close-r)" />
				</svg>
				<h2>Keep your account.<br /><span>Choose your client.</span></h2>
				<a class="button button-primary" href="#top">Back to top</a>
			</div>
		</section>
	</main>

	<footer class="footer"><div class="wrap footer-inner"><a class="brand" href="#top"><img src="/icon.svg" alt="" width="24" height="24" /><span>Unisend</span></a><span>Rust, GPUI, Matrix. No trackers on this page either.</span></div></footer>
</div>
