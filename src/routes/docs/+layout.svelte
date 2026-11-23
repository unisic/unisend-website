<script>
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';

	/** @type {import('./$types').LayoutProps} */
	let { data, children } = $props();

	let open = $state(false);
	afterNavigate(() => (open = false));
</script>

<div class="docs">
	<a class="skip" href="#main">Skip to content</a>
	<header class="nav wrap">
		<a class="brand" href="/"><img src="/icon.svg" alt="" width="28" height="28" />Unisend</a>
		<a class="here" href="/docs/">Docs</a>
	</header>
	<div class="wrap shell">
		<aside class="side" data-open={open}>
			<button class="menu" type="button" aria-expanded={open} aria-controls="docs-nav" onclick={() => (open = !open)}>
				<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
				Pages
			</button>
			<nav id="docs-nav" aria-label="Documentation">
				<a href="/docs/" aria-current={page.url.pathname === '/docs/' ? 'page' : undefined}>Overview</a>
				{#each data.groups as g (g.group)}
					<p class="group">{g.group}</p>
					<ul>
						{#each g.docs as d (d.slug)}
							<li><a href="/docs/{d.slug}/" aria-current={page.url.pathname === `/docs/${d.slug}/` ? 'page' : undefined}>{d.title}</a></li>
						{/each}
					</ul>
				{/each}
			</nav>
		</aside>
		<main id="main" tabindex="-1">
			{@render children()}
		</main>
	</div>
	<footer class="footer wrap"><a href="/">Unisend</a><a href="https://github.com/unisic/unisend-website/tree/main/content/docs">These pages on GitHub</a></footer>
</div>

<style>
	.here { color: var(--muted); font-size: var(--fs-small); text-underline-offset: 3px; }
	.shell { display: grid; gap: 32px; padding-top: 24px; }
	main { min-width: 0; outline: none; }
	.menu { display: none; align-items: center; gap: 8px; min-height: 44px; padding: 0 18px; border: 0; border-radius: 999px; background: var(--well); color: var(--ink); font: inherit; font-size: var(--fs-small); font-weight: 500; cursor: pointer; transition: transform .16s var(--ease); }
	.menu:active { transform: scale(.96); }
	.menu .ico { width: 18px; height: 18px; }
	nav { display: grid; gap: 2px; align-content: start; }
	ul { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
	.group { margin: 20px 0 4px; padding-inline: 12px; color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
	nav a { display: block; padding: 7px 12px; border-radius: 10px; color: var(--muted); font-size: var(--fs-small); text-decoration: none; transition: background-color .15s, color .15s; }
	nav a[aria-current='page'] { background: var(--well); color: var(--ink); }
	@media (hover: hover) and (pointer: fine) {
		nav a:hover { background: var(--surface); color: var(--ink); }
	}
	@media (max-width: 899px) and (scripting: enabled) {
		.menu { display: inline-flex; }
		.side[data-open='false'] nav { display: none; }
		.side[data-open='true'] nav { margin-top: 12px; }
	}
	@media (min-width: 900px) {
		.shell { grid-template-columns: 220px minmax(0, 1fr); gap: 64px; padding-top: 40px; }
		.side { position: sticky; top: 24px; align-self: start; max-height: calc(100dvh - 48px); overflow-y: auto; overscroll-behavior: contain; scrollbar-width: thin; }
	}
</style>
