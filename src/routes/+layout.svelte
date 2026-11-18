<script>
	import '../app.css';
	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="32x32" />
	<link rel="preload" href="/fonts/Inter-Regular.ttf" as="font" type="font/ttf" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/Inter-Medium.ttf" as="font" type="font/ttf" crossorigin="anonymous" />
</svelte:head>

{@render children()}
