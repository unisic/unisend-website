<script>
	import '../app.css';
	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48" />
	<link rel="icon" href="/icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="preload" href="/fonts/Inter-Regular.woff" as="font" type="font/woff" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/Inter-SemiBold.woff" as="font" type="font/woff" crossorigin="anonymous" />
</svelte:head>

{@render children()}
