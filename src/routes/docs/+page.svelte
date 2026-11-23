<script>
	import { site } from '#lib/site.js';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const description = 'How to install Unisend, sign in, and what it keeps and sends: the Matrix client for Android and the Linux desktop.';
</script>

<svelte:head>
	<title>Documentation | Unisend</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{site}docs/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{site}docs/" />
	<meta property="og:title" content="Unisend documentation" />
	<meta property="og:description" content={description} />
</svelte:head>

<header class="intro">
	<h1>Documentation</h1>
	<p class="lead">Installing Unisend, signing in, using it day to day, and what leaves your device. Every page is a Markdown file in the website's repository.</p>
</header>

{#each data.groups as g, i (g.group)}
	<section class="group" aria-labelledby="group-{i}">
		<h2 id="group-{i}">{g.group}</h2>
		<ul>
			{#each g.docs as d (d.slug)}
				<li><a href="/docs/{d.slug}/"><b>{d.title}</b><span>{d.description}</span></a></li>
			{/each}
		</ul>
	</section>
{/each}

<style>
	.intro { display: grid; gap: 20px; margin-bottom: 56px; }
	h1 { font-size: var(--fs-h2); }
	.group { margin-bottom: 40px; }
	h2 { margin-bottom: 14px; color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
	ul { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
	li { display: grid; }
	a { display: grid; align-content: start; gap: 6px; padding: 18px 20px; border-radius: 18px; background: var(--surface); text-decoration: none; transition: background-color .15s; }
	b { font-weight: 600; }
	span { color: var(--muted); font-size: var(--fs-small); line-height: 1.45; text-wrap: pretty; }
	@media (hover: hover) and (pointer: fine) {
		a:hover { background: var(--well); }
	}
</style>
