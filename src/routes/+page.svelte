<script>
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	// The two halves of the app icon's U, in its 108-unit canvas.
	const LEFT = 'M27.764,30.956L27.764,73.292Q27.764,81.524 24.236,85.64Q31.292,82.7 38.348,82.7L53.342,82.7L53.342,67.239A12.348,12.348 0 0 1 43.052,55.064L43.052,30.956A7.644,7.644 0 0 0 27.764,30.956Z';
	const RIGHT = 'M57.458,82.623A27.636,27.636 0 0 0 83.036,55.064L83.036,30.956A7.644,7.644 0 0 0 67.748,30.956L67.748,55.064A12.348,12.348 0 0 1 57.458,67.239Z';

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

	const screens = [
		{ name: 'Chat list' },
		{ name: 'A chat', src: '/shots/chat.png', alt: 'A group chat with a photo, a reply and a poll' },
		{ name: 'Appearance', src: '/shots/settings.png', alt: 'Appearance settings: theme, language, chat colour, text size' }
	];
	let screen = $state(0);

	const sees = [
		{ who: 'This device', what: 'Your messages, keys and settings. On Android the app\'s data is encrypted with a key held in the Android Keystore, and the app can lock with your phone\'s lock or a PIN.' },
		{ who: 'Your homeserver', what: 'What any Matrix server sees: your account, the rooms you are in, message metadata, your IP address and the content of unencrypted rooms. Encrypted rooms are end-to-end encrypted.' },
		{ who: 'Beeper bridges', what: 'Only with a Beeper account. A bridge has to read a message to pass it between Matrix and the other network, so it sees the content of bridged chats.' },
		{ who: 'The other network', what: 'WhatsApp, Messenger and the rest see what they always see. Nothing more comes from Unisend.' },
		{ who: 'Anyone else', what: 'Only for what you turn on or tap: a site you link, once, with link previews on; GIF search, in builds that include it; an emoji font you download; a location you open. Builds made with an update address ask it once a day for update.json, with no identifier.' }
	];
	const zeros = [
		['telemetry', 'Nothing about how you use the app is counted or sent.'],
		['crash reports', 'No crash reporting. A crash is not sent anywhere.'],
		['Google services', 'No Firebase and no Play Services in the app.'],
		['push servers', 'No push service. On Android the app keeps its own connection to your homeserver.']
	];
	const platforms = [['Android', 'main target'], ['Linux', 'tested'], ['macOS', 'in progress'], ['Windows', 'compiles, never run']];
	const wave = [6, 10, 16, 9, 22, 14, 26, 18, 12, 20, 28, 16, 10, 22, 14, 8, 18, 24, 12, 16, 8, 12, 20, 10, 6, 14, 9, 5];
	// The words Matrix shows beside its seven verification emoji.
	const sas = ['Dog', 'Key', 'Rocket', 'Cactus', 'Guitar', 'Pizza', 'Octopus'];
</script>

<svelte:head>
	<title>Unisend | Every chat, one private app</title>
	<meta name="description" content="A Matrix chat client for Android and desktop. Any homeserver, or a Beeper account with its bridges to WhatsApp, Signal, Instagram and more. No telemetry, no Google services." />
	<meta property="og:title" content="Unisend | Every chat, one private app" />
	<meta property="og:description" content="A Matrix chat client for Android and desktop." />
</svelte:head>

{#snippet icon(/** @type {string} */ d)}<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">{@html d}</svg>{/snippet}
{#snippet name()}<svg class="u" viewBox="24 23.3 59.2 62.4" aria-hidden="true"><path class="half-l" d={LEFT} /><path class="half-r" d={RIGHT} /></svg>nisend{/snippet}

<div class="page" {@attach observe}>
	<a class="skip" href="#main">Skip to content</a>

	<main id="main">
		<section class="hero" id="top">
			<header class="nav">
				<a class="brand" href="#top" aria-label="Unisend, back to top"><img src="/icon.svg" alt="" width="24" height="24" />Unisend</a>
				<nav aria-label="Sections"><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
			</header>
			<div class="hero-copy">
				<p class="lead">Uni plus send: one private app for your Matrix chats and, with a Beeper account, WhatsApp, Signal, Instagram and the rest.</p>
				<a class="button" href="#list">See it work</a>
			</div>
			<h1 class="monument"><span class="sr-only">Unisend</span><span aria-hidden="true">{@render name()}</span></h1>
		</section>

		<section class="showcase" id="list" aria-labelledby="list-title">
			<div class="plate reveal">
				<div class="screen" role="tabpanel" id="screen-panel" aria-labelledby="screen-{screen}">
					{#if screen === 0}
						<div class="app-list" data-ui role="img" aria-label="The Unisend chat list, where new messages arrive and move their chat to the top" {@attach every(arrive, 2600)} in:fade={{ duration: 200 }}>
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
					{:else}
						{#key screen}<img src={screens[screen].src} alt={screens[screen].alt} width="420" height="880" in:fade={{ duration: 200 }} />{/key}
					{/if}
				</div>
			</div>
			<div class="showcase-copy">
				<div class="tablist reveal" role="tablist" aria-label="Screens from the Android app">
					{#each screens as s, i (s.name)}
						<button role="tab" id="screen-{i}" aria-selected={screen === i} aria-controls="screen-panel" onclick={() => (screen = i)}>{s.name}</button>
					{/each}
				</div>
				<div class="reveal">
					<h2 id="list-title">Every network, one list</h2>
					<p>A new message lifts its chat to the top, whatever network it came from. Any Matrix homeserver, plus every network a Beeper account bridges: WhatsApp, Signal, Instagram, Messenger, Telegram, Discord and more.</p>
				</div>
				<div class="cells reveal"><a class="cell" href="#privacy">Who sees what</a><a class="cell alt" href="#desktop">On desktop</a></div>
			</div>
		</section>

		<section class="desktop" id="desktop" aria-labelledby="desktop-title">
			<div class="desktop-head reveal">
				<h2 id="desktop-title">Wide window, three panes</h2>
				<p>Make the window wide and the chat list, the chat and its info sit side by side. Narrow it, and it is the phone app again.</p>
			</div>
			<img class="reveal" src="/shots/desktop.png" alt="Unisend on desktop: the chat list beside a group chat with a reply, reactions and a poll" width="1280" height="800" loading="lazy" />
		</section>

		<section class="features" id="features" aria-labelledby="features-title">
			<h2 class="reveal" id="features-title">All the chat things, none of the tracking</h2>
			<div class="module reveal">
				<div class="proof crop"><img src="/shots/chat.png" alt="A poll in a group chat: two options with their votes" width="420" height="880" loading="lazy" style:--x="-48px" style:--y="-628px" /></div>
				<div class="module-text"><h3>Talk like you do everywhere</h3><p>Replies, reactions, edits, polls, mentions, voice messages and Markdown as you type.</p><p>Delete for everyone or only for you.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof crop"><img src="/shots/settings.png" alt="The chat colour setting with ten colours" width="420" height="880" loading="lazy" style:--x="-16px" style:--y="-306px" style:--ch="164px" /></div>
				<div class="module-text"><h3>Black, quiet, yours</h3><p>Dark, light or system theme, nine chat colours, a wallpaper and five text sizes.</p><p>In English and Polish.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof demo" data-ui aria-hidden="true">
					<span class="voice"><span class="play"></span>{#each wave as h, i (i)}<i style:--h="{h}px" style:--d="{i * 70}ms"></i>{/each}</span>
				</div>
				<div class="module-text"><h3>Voice messages</h3><p>Recorded and played right in the chat.</p><p>On Android and Linux.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof demo" data-ui aria-hidden="true">
					<span class="queue"><span class="bubble">On my way<span class="tick"><span class="clock">{@render icon(ICONS.clock)}</span><span class="sent">{@render icon(ICONS.check)}</span></span></span><span class="offline">Offline</span></span>
				</div>
				<div class="module-text"><h3>Offline, still sent</h3><p>Messages wait in a queue that survives losing signal and restarting the app.</p><p>They go out when the connection is back.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof demo" data-ui aria-hidden="true">
					<span class="search"><span class="field"><span class="typed">hike</span></span><span class="hit"><b>Weekend hike</b> lake, obviously</span></span>
				</div>
				<div class="module-text"><h3>Search on the device</h3><p>One index across every chat.</p><p>Kept here, not on a server.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof demo" data-ui aria-hidden="true">
					<span class="notes"><span class="note n1"><b>Maya Chen</b>See you at 8</span><span class="note n2"><b>Maya Chen</b>New message</span><span class="note n3"><b>Unisend</b>New message</span></span>
				</div>
				<div class="module-text"><h3>Notifications that keep quiet</h3><p>Name and message, name only, or neither.</p><p>No push service: Android keeps its own connection.</p></div>
			</div>
			<div class="module reveal">
				<div class="proof demo" data-ui aria-hidden="true">
					<span class="verify">{#each sas as w, i (w)}<span style:--d="{i * 90}ms">{w}</span>{/each}</span>
				</div>
				<div class="module-text"><h3>Encrypted, end to end</h3><p>Verify a device by comparing seven emoji.</p><p>History comes back with your recovery code.</p></div>
			</div>
		</section>

		<section class="privacy" id="privacy" aria-labelledby="privacy-title">
			<h2 class="reveal" id="privacy-title">Who sees what, and nothing more</h2>
			<div class="privacy-body">
				<div class="privacy-pic reveal"><img src="/shots/chat.png" alt="A lake at sunset, shared in a group chat" width="420" height="880" loading="lazy" /></div>
				<dl class="sees reveal">
					{#each sees as s (s.who)}<div><dt>{s.who}</dt><dd>{s.what}</dd></div>{/each}
				</dl>
			</div>
		</section>

		<section class="zeros" aria-labelledby="zeros-title">
			<h2 class="reveal" id="zeros-title">Nothing to report</h2>
			<dl class="reveal">
				{#each zeros as [what, why] (what)}<div><dt>0</dt><dd><b>{what}.</b> {why}</dd></div>{/each}
			</dl>
		</section>
	</main>

	<footer class="footer" aria-labelledby="footer-title">
		<div class="footer-top">
			<div class="reveal">
				<h2 id="footer-title">Your account. Your client.</h2>
				<a class="button" href="#privacy">Read who sees what</a>
			</div>
			<div class="platforms reveal" id="platforms">
				<h3>Where it runs</h3>
				<ul>{#each platforms as [os, state] (os)}<li><b>{os}</b>, {state}</li>{/each}</ul>
				<p>One Rust codebase. GPUI draws, matrix-sdk talks to Matrix on its own thread.</p>
			</div>
		</div>
		<div class="legal"><span>No trackers on this page either.</span><a href="/LICENSE-LUCIDE.txt">Icons: Lucide, ISC licence</a></div>
		<p class="footer-name" aria-hidden="true">{@render name()}</p>
	</footer>
</div>
