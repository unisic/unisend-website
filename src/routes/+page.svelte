<script>
	/** @param {HTMLElement} node */
	const observe = (node) => {
		node.classList.add('motion-ready');
		const items = node.querySelectorAll('.reveal');
		if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
			items.forEach((item) => item.classList.add('visible'));
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			}
		}, { threshold: 0.14 });
		items.forEach((item) => observer.observe(item));
		return () => observer.disconnect();
	};

	const features = [
		{ title: 'Chats', items: ['Replies, reactions, edits, and delete for everyone or only for you', 'Polls, contact cards, mentions and Markdown as you type', 'Archive, pin, mute for a set time, mark as unread', 'Search across all chats in an index kept on the device', 'Messages wait in a queue that survives going offline'] },
		{ title: 'Media', items: ['Photos, videos and files with a caption', 'Voice messages, recorded and played in the chat', 'Emoji picker with search, recents and skin tones', 'Each chat\'s media, links and files in its info page', 'Full-screen viewer with zoom'] },
		{ title: 'Networks', items: ['Any Matrix homeserver: OAuth 2.0, single sign-on or a password', 'Beeper accounts with an email code', 'WhatsApp, Signal, Messenger and more through Beeper bridges', 'See when a network needs a new sign-in', 'Actions a network cannot take are hidden, not left to fail'] },
		{ title: 'Notifications', items: ['One notification per chat, with reply and mark as read', 'Android keeps its own connection to the homeserver, with no push service', 'Linux desktop notifications with reply and mute', 'Choose what shows: name and message, name only, or neither'] },
		{ title: 'Security', items: ['End-to-end encryption and history unlocked with your recovery code', 'Verify a device by comparing emoji, sign one out', 'App lock with the phone\'s lock or an app PIN', 'Screen security and an incognito keyboard switch on Android'] },
		{ title: 'Desktop', items: ['Chat list, chat and chat info side by side', 'Keeps running with the window closed, with a tray icon on Linux', 'Drag and drop or paste files', 'Its own title bar where the compositor allows it'] }
	];
</script>

<svelte:head>
	<title>Unisend | Private Matrix messaging</title>
	<meta name="description" content="A Matrix chat client for Android and desktop. Any homeserver, or a Beeper account with its bridges. No telemetry, no Google services." />
	<meta property="og:title" content="Unisend | Private Matrix messaging" />
	<meta property="og:description" content="A Matrix chat client for Android and desktop." />
</svelte:head>

<div class="page" {@attach observe}>
	<a class="skip" href="#main">Skip to content</a>
	<header class="nav">
		<div class="wrap nav-inner">
			<a class="brand" href="#top" aria-label="Unisend, back to top"><img src="/icon.svg" alt="" width="32" height="32" /><span>Unisend</span></a>
			<nav class="nav-links" aria-label="Sections"><a href="#product">Product</a><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
		</div>
	</header>
	<main id="main">
		<section class="hero" id="top">
			<div class="wrap hero-top">
				<div class="hero-copy">
					<img class="hero-icon" src="/icon.svg" alt="" width="88" height="88" />
					<h1>Every chat.<br /><span>One private app.</span></h1>
					<p class="lede">Unisend is a Matrix chat client for Android and desktop. Bring any homeserver, or a Beeper account with its bridges to WhatsApp, Signal, Messenger and more.</p>
					<div class="hero-actions"><a class="button button-primary" href="#features">See what it does</a><a class="button button-secondary" href="#privacy">Privacy</a></div>
					<p class="hero-note">No telemetry. No Google services. No push service.</p>
				</div>
				<div class="hero-media">
					<figure class="desktop-frame"><img src="/shots/desktop.png" alt="Unisend on desktop: a chat list beside a group chat with reactions, a reply and a poll" width="1280" height="800" fetchpriority="high" /></figure>
				</div>
			</div>
		</section>

		<section class="section" id="product">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">Made for the phone first</p><h2>Quiet, black and fast.</h2><p class="section-lede">One interface for phone and desktop. A narrow window gets the phone layout on any platform; a wide one shows the chat list and the chat side by side.</p></div>
				<div class="showcase reveal">
					<figure class="shot-card"><img src="/shots/chat-list.png" alt="Unisend chat list with unread counts" width="420" height="880" loading="lazy" /><figcaption>Chats</figcaption></figure>
					<figure class="shot-card"><img src="/shots/chat.png" alt="Unisend group chat with a poll" width="420" height="880" loading="lazy" /><figcaption>A group chat</figcaption></figure>
					<figure class="shot-card"><img src="/shots/settings.png" alt="Unisend appearance settings: theme, language, chat colour and text size" width="420" height="880" loading="lazy" /><figcaption>Appearance</figcaption></figure>
				</div>
			</div>
		</section>

		<section class="section" id="features">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">What it does</p><h2>Everything a chat app needs.</h2><p class="section-lede">Dark, light or system theme, chat colours, a wallpaper, five text sizes, English and Polish.</p></div>
				<div class="features">
					{#each features as group (group.title)}
						<article class="feature reveal">
							<h3>{group.title}</h3>
							<ul>{#each group.items as item (item)}<li>{item}</li>{/each}</ul>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<section class="section" id="privacy">
			<div class="wrap privacy-band">
				<div class="section-head reveal"><p class="eyebrow">Privacy first</p><h2>Less sent.<br />To fewer parties.</h2><p class="section-lede">No telemetry, crash reporting, Google services or push service. Read and typing state stay hidden from others until you turn them on.</p></div>
				<div class="privacy-list reveal">
					<div class="privacy-item"><b>Previews made on this device</b><p>When you turn link previews on, the preview is fetched here before sending. Recipients do not fetch it for you.</p></div>
					<div class="privacy-item"><b>Data encrypted at rest</b><p>On Android the app's data is encrypted with a key held in the Android Keystore.</p></div>
					<div class="privacy-item"><b>Logs without content</b><p>Logs name files and error types. Message text, names, tokens and keys stay out of them.</p></div>
					<div class="privacy-item"><b>Know who sees what</b><p>Your homeserver carries Matrix traffic. Bridges and the networks behind them see the messages that pass through them.</p></div>
				</div>
			</div>
		</section>

		<section class="section" id="platforms">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">Platforms</p><h2>Rust underneath.<br />One codebase.</h2><p class="section-lede">Built with GPUI and matrix-sdk. The Matrix side runs on its own thread, so the interface never waits on the network.</p></div>
				<div class="platforms reveal">
					<div class="platform"><b>Android</b><span>Main target</span><p>Built and tested on a phone.</p></div>
					<div class="platform"><b>Linux</b><span>Tested</span><p>Desktop client, built and tested.</p></div>
					<div class="platform"><b>macOS</b><span>In progress</span><p>Builds and runs, no released package.</p></div>
					<div class="platform"><b>Windows</b><span>Compiles</span><p>Compiles, never run.</p></div>
				</div>
			</div>
		</section>

		<section class="closing"><div class="wrap reveal"><img class="hero-icon" src="/icon.svg" alt="" width="72" height="72" /><h2>Keep your account.<br />Choose your client.</h2><a class="button button-primary" href="#top">Back to top</a></div></section>
	</main>
	<footer class="footer"><div class="wrap footer-inner"><a class="brand" href="#top"><img src="/icon.svg" alt="" width="24" height="24" /><span>Unisend</span></a><span>Rust, GPUI, Matrix</span></div></footer>
</div>
