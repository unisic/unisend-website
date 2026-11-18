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
</script>

<svelte:head>
	<title>Unisend | Private Matrix messaging</title>
	<meta name="description" content="A Matrix chat client for Android and desktop. Privacy choices that stay in your hands." />
	<meta property="og:title" content="Unisend | Private Matrix messaging" />
	<meta property="og:description" content="A Matrix chat client for Android and desktop." />
	<meta name="theme-color" content="#0b0d0b" />
</svelte:head>

<div class="page" {@attach observe}>
	<a class="skip" href="#main">Skip to content</a>
	<header class="nav">
		<div class="wrap nav-inner">
			<a class="brand" href="#top" aria-label="Unisend, back to top"><span class="brand-mark" aria-hidden="true">u</span><span>Unisend</span></a>
			<nav class="nav-links" aria-label="Sections"><a href="#product">Product</a><a href="#privacy">Privacy</a><a href="#platforms">Platforms</a></nav>
			<a class="nav-cta" href="#privacy">Privacy details <span aria-hidden="true">↓</span></a>
		</div>
	</header>
	<main id="main">
		<section class="hero" id="top">
			<div class="wrap hero-top">
				<div class="hero-copy">
					<p class="eyebrow">Matrix, on your terms</p>
					<h1>Your chats.<br /><span>Your choice.</span></h1>
					<p class="lede">Unisend is a Matrix chat client built with Rust and GPUI. Bring your homeserver, or connect a Beeper account and its bridges.</p>
					<div class="hero-actions"><a class="button button-primary" href="#product">Explore Unisend <span aria-hidden="true">↓</span></a><a class="button button-secondary" href="#privacy">Privacy details <span aria-hidden="true">↓</span></a></div>
					<p class="hero-note">Android first. Linux desktop. No telemetry, no Google services.</p>
				</div>
				<div class="hero-media">
					<figure class="desktop-frame"><img src="/shots/desktop.png" alt="Unisend desktop chat with a weekend hiking group, reactions and poll" width="1280" height="800" fetchpriority="high" /></figure>
				</div>
			</div>
		</section>

		<section class="section" id="product">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">One client, your network</p><h2>Matrix at the center.<br />Your choice around it.</h2><p class="section-lede">Sign in to an existing Matrix account on any homeserver. With a Beeper account, connect its bridges to WhatsApp, Signal, Messenger and other networks.</p></div>
				<div class="showcase reveal">
					<figure class="shot-card"><img src="/shots/chat.png" alt="Unisend chat view with a group poll" width="420" height="880" loading="lazy" /><figcaption><span>Chat, in context</span><span>Android</span></figcaption></figure>
					<figure class="shot-card"><img src="/shots/chat-list.png" alt="Unisend chat list with conversations and unread markers" width="420" height="880" loading="lazy" /><figcaption><span>Your conversations</span><span>Android</span></figcaption></figure>
				</div>
				<div class="feature-row">
					<div class="feature-copy reveal"><p class="eyebrow">Made to fit</p><h2>A familiar shape.<br />Room to make it yours.</h2><p>Choose dark, light or system appearance. Adjust text size, language, chat colour, wallpaper and emoji. Set how Enter behaves on desktop, and reduce animation independently of your system preference.</p></div>
					<div class="setting-card reveal" aria-label="Appearance settings preview">
						<div class="setting-line"><span class="setting-icon" aria-hidden="true">◐</span><div>Appearance<small>Dark theme · text 100%</small></div><span aria-hidden="true">›</span></div>
						<div class="setting-line"><span class="setting-icon" aria-hidden="true">↵</span><div>Enter sends<small>Shift+Enter adds a line</small></div><span class="switch" aria-hidden="true"></span></div>
						<div class="setting-line"><span class="setting-icon" aria-hidden="true">◌</span><div>Reduce motion<small>Independent of system settings</small></div><span class="switch" aria-hidden="true"></span></div>
					</div>
				</div>
			</div>
		</section>

		<section class="section" id="privacy">
			<div class="wrap privacy-band">
				<div class="section-head reveal"><p class="eyebrow">Privacy by default</p><h2>Less sent.<br />More control.</h2><p class="section-lede">No telemetry, crash reporting, Google services or push service. Read receipts are off by default. Your choices are visible and local.</p></div>
				<div class="privacy-list reveal">
					<div class="privacy-item"><span class="number">01</span><div><b>Previews made on this device</b><p>When enabled, a link preview is fetched here before sending. Recipients do not fetch it for you.</p></div></div>
					<div class="privacy-item"><span class="number">02</span><div><b>Keep the app close</b><p>Lock Unisend with your phone's lock or an app PIN. On Android, app data is encrypted with a key held in Android Keystore.</p></div></div>
					<div class="privacy-item"><span class="number">03</span><div><b>Encrypted conversations</b><p>Matrix end-to-end encryption, with encrypted history restored using your recovery code.</p></div></div>
					<div class="privacy-item"><span class="number">04</span><div><b>Know what connects</b><p>Your homeserver handles Matrix traffic. Beeper bridges and the connected networks handle messages that pass through them.</p></div></div>
				</div>
			</div>
		</section>

		<section class="section" id="platforms">
			<div class="wrap">
				<div class="section-head reveal"><p class="eyebrow">Built across screens</p><h2>One client.<br />Different stages.</h2><p class="section-lede">Android is the main target. Linux is built and tested. Other platforms remain at different points in development.</p></div>
				<div class="platforms reveal">
					<div class="platform"><b>Android</b><span>MAIN TARGET</span><p>Built and tested on a phone.</p></div>
					<div class="platform"><b>Linux</b><span>TESTED</span><p>Desktop client, built and tested.</p></div>
					<div class="platform"><b>macOS</b><span>IN PROGRESS</span><p>Builds and runs, no released package.</p></div>
					<div class="platform"><b>Windows</b><span>COMPILE CHECK</span><p>Compiles, never run.</p></div>
				</div>
				<div class="feature-row reverse">
					<div class="feature-copy reveal"><p class="eyebrow">Native foundations</p><h2>Rust underneath.<br />GPUI on the surface.</h2><p>The Matrix backend runs separately from the interface. Bounded channels carry commands and events between them, so the UI does not wait on network work.</p></div>
					<figure class="shot-card reveal"><img src="/shots/settings.png" alt="Unisend appearance settings on Android" width="420" height="880" loading="lazy" /><figcaption><span>Preferences stay on device</span><span>Settings</span></figcaption></figure>
				</div>
			</div>
		</section>

		<section class="closing"><div class="wrap reveal"><p class="eyebrow">A Matrix client</p><h2>Keep your account.<br />Choose your client.</h2><a class="button button-primary" href="#privacy">Explore privacy <span aria-hidden="true">↓</span></a></div></section>
	</main>
	<footer class="footer"><div class="wrap footer-inner"><a class="brand" href="#top"><span class="brand-mark" aria-hidden="true">u</span><span>Unisend</span></a><span>Rust · GPUI · Matrix</span><div class="footer-links"><a href="#product">About Unisend</a><a href="#privacy">Privacy</a><a href="#top">Back to top ↑</a></div></div></footer>
</div>
