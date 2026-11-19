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

	let chats = $state([
		{ id: 1, name: 'Maya Chen', net: 1, text: 'A bit torn, but it will do', unread: 2, hue: 300 },
		{ id: 2, name: 'Weekend hike', net: 0, text: 'Jonas: Lake, obviously', unread: 0, hue: 140 },
		{ id: 3, name: 'Ana Ruiz', net: 2, text: 'You: Yes, 10:30 at the usual place', unread: 0, hue: 22 },
		{ id: 4, name: 'Daniel Park', net: 6, text: 'The slides are in the shared folder', unread: 0, hue: 205 },
		{ id: 5, name: 'Climbing Tuesdays', net: 5, text: 'Chris: Gym is open until 10', unread: 0, hue: 350 },
		{ id: 6, name: 'Mom', net: 3, text: 'Call me when you are back', unread: 0, hue: 15 },
		{ id: 7, name: 'Elif Kaya', net: 4, text: 'You: Let me know how it turns out', unread: 0, hue: 265 }
	]);
	const incoming = [
		[3, 'Lunch tomorrow?'], [2, 'Tom: Forecast says sun until 3'], [5, 'Lena: Who has the rope?'],
		[1, 'Sent a photo'], [6, 'Did you eat?'], [2, 'Priya: Picnic it is'], [7, 'It worked!'], [3, 'Voice message, 0:14'], [4, 'Thanks, got them']
	];
	const times = ['now', '2m', '9m', '24m', '1h', '2h', '5h'];
	let step = 0;
	const arrive = () => {
		const [id, text] = incoming[step++ % incoming.length];
		const [chat] = chats.splice(chats.findIndex((c) => c.id === id), 1);
		chat.text = /** @type {string} */ (text);
		chat.unread = (chat.unread % 3) + 1;
		chats.unshift(chat);
		for (const c of chats.slice(4)) c.unread = 0; // read further down, so the counts stay few
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

				<div class="phone" aria-label="A Unisend chat list where new messages from different networks arrive" role="img" {@attach every(arrive, 2600)}>
					<div class="phone-screen">
						<div class="phone-bar"><b>Chats</b><span class="chips"><i class="chip on">All</i><i class="chip">Unread</i></span></div>
						<ul class="rows">
							{#each chats as chat, i (chat.id)}
								<li class="row" class:fresh={i === 0} animate:flip={{ duration: 520, easing: cubicOut }}>
									<span class="avatar" style:--h={chat.hue}><i style:background={networks[chat.net].color}></i></span>
									<span class="row-text"><b>{chat.name}</b><span>{chat.text}</span></span>
									<span class="row-meta"><small>{times[i]}</small>{#if chat.unread}<em>{chat.unread}</em>{/if}</span>
								</li>
							{/each}
						</ul>
						<div class="tabs" aria-hidden="true"><span class="on">Chats</span><span>Archive</span><span>Networks</span><span>Settings</span></div>
					</div>
				</div>
			</div>
		</section>

		<div class="marquee" aria-hidden="true">
			<div class="marquee-track">
				{#each [0, 1] as copy (copy)}
					<span class="marquee-set">
						{#each networks as n (n.name)}<span class="marquee-item"><svg viewBox="20 24 68 64"><path d={LEFT} /><path d={RIGHT} /></svg>{n.name}</span>{/each}
					</span>
				{/each}
			</div>
		</div>

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
					<article class="tile demo reveal">
						<div class="notes" aria-hidden="true">
							<span class="note n1"><b>Maya Chen</b>See you at 8</span>
							<span class="note n2"><b>Maya Chen</b>New message</span>
							<span class="note n3"><b>Unisend</b>New message</span>
						</div>
						<h3>Notifications that keep quiet</h3>
						<p>Name and message, name only, or neither. No push service: Android keeps its own connection.</p>
					</article>
					<article class="tile demo reveal">
						<div class="verify" aria-hidden="true">{#each ['🐶', '🔑', '🚀', '🌵', '🎸', '🍕', '🐙'] as e, i (e)}<span style:--d="{i * 90}ms">{e}</span>{/each}</div>
						<h3>Encrypted, end to end</h3>
						<p>Verify a device by comparing emoji. History comes back with your recovery code.</p>
					</article>
					<article class="tile wide shot-tile reveal">
						<img src="/shots/desktop.png" alt="Unisend on desktop: chat list beside a group chat" width="1280" height="800" loading="lazy" />
						<h3>Wide window, side by side</h3>
						<p>Chat list, chat and chat info next to each other. Runs on in the tray with the window closed.</p>
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
