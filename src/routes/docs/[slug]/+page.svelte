<script>
	import { site } from '#lib/site.js';

	/** @type {import('./$types').PageProps} */
	let { data } = $props();

	const doc = $derived(data.doc);
	const url = $derived(`${site}docs/${doc.slug}/`);

	let active = $state('');

	/* The entry of the last heading above the upper third of the viewport is lit. Recomputed at most
	   once a frame while scrolling: one getBoundingClientRect per heading, a dozen or two at most. */
	$effect(() => {
		const els = doc.toc.map((t) => document.getElementById(t.id)).filter((el) => el !== null);
		let frame = 0;
		const update = () => {
			frame = 0;
			const line = innerHeight / 3;
			active = els.findLast((el) => el.getBoundingClientRect().top < line)?.id ?? '';
		};
		const onscroll = () => {
			frame ||= requestAnimationFrame(update);
		};
		update();
		addEventListener('scroll', onscroll, { passive: true });
		return () => {
			removeEventListener('scroll', onscroll);
			cancelAnimationFrame(frame);
		};
	});
</script>

<svelte:head>
	<title>{doc.title} | Unisend docs</title>
	<meta name="description" content={doc.description} />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={url} />
	<meta property="og:title" content="{doc.title} | Unisend docs" />
	<meta property="og:description" content={doc.description} />
</svelte:head>

{#snippet toc()}
	<ul>
		{#each doc.toc as t (t.id)}
			<li class:sub={t.depth === 3}><a href="#{t.id}" aria-current={active === t.id ? 'true' : undefined}>{t.text}</a></li>
		{/each}
	</ul>
{/snippet}

<div class="page" class:rail={doc.toc.length > 0}>
	<article>
		<header class="head">
			<p class="crumb">{doc.group}</p>
			<h1>{doc.title}</h1>
			<p class="lead">{doc.description}</p>
		</header>

		{#if doc.toc.length}
			<details class="toc-m">
				<summary>On this page</summary>
				{@render toc()}
			</details>
		{/if}

		<!-- Rendered at build time from the repository's own Markdown. -->
		<div class="prose">{@html doc.html}</div>

		<footer class="end">
			<a class="edit" href="https://github.com/unisic/unisend-website/edit/main/content/docs/{doc.slug}.md">Edit this page on GitHub</a>
			{#if data.prev || data.next}
				<nav class="pager" aria-label="Previous and next page">
					{#if data.prev}<a class="prev" href="/docs/{data.prev.slug}/" rel="prev"><span>Previous</span>{data.prev.title}</a>{/if}
					{#if data.next}<a class="next" href="/docs/{data.next.slug}/" rel="next"><span>Next</span>{data.next.title}</a>{/if}
				</nav>
			{/if}
		</footer>
	</article>

	{#if doc.toc.length}
		<nav class="toc" aria-labelledby="toc-title">
			<p id="toc-title" class="crumb">On this page</p>
			{@render toc()}
		</nav>
	{/if}
</div>

<style>
	.page { display: grid; gap: 48px; }
	article { min-width: 0; }
	.head { display: grid; gap: 16px; margin-bottom: 40px; }
	h1 { font-size: var(--fs-h2); }
	.crumb { color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

	ul { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }
	li a { display: block; padding: 4px 12px; color: var(--muted); font-size: var(--fs-small); line-height: 1.45; text-decoration: none; text-wrap: pretty; transition: color .15s; }
	.sub a { padding-left: 24px; }
	li a[aria-current='true'] { color: var(--ink); box-shadow: inset 2px 0 0 var(--accent); }
	@media (hover: hover) and (pointer: fine) {
		li a:hover { color: var(--ink); }
	}
	.toc-m { margin-bottom: 40px; border-radius: 16px; background: var(--surface); }
	.toc-m summary { padding: 12px 16px; font-weight: 500; cursor: pointer; }
	.toc-m ul { padding: 0 8px 12px; }
	.toc { display: none; }

	.end { display: grid; gap: 20px; max-width: 70ch; margin-top: 64px; padding-top: 20px; border-top: 1px solid var(--raised); }
	.edit { justify-self: start; color: var(--accent); font-size: var(--fs-small); text-underline-offset: 3px; }
	.pager { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: 12px; }
	.pager a { display: grid; gap: 4px; padding: 16px 20px; border-radius: 18px; background: var(--surface); font-weight: 600; text-decoration: none; transition: background-color .15s; }
	.pager span { color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }
	.next { grid-column: -2; text-align: end; }
	@media (hover: hover) and (pointer: fine) {
		.pager a:hover { background: var(--well); }
	}
	@media (min-width: 1180px) {
		.rail { grid-template-columns: minmax(0, 1fr) 200px; gap: 56px; }
		.toc-m { display: none; }
		.toc { position: sticky; top: 24px; align-self: start; display: grid; gap: 12px; max-height: calc(100dvh - 48px); overflow-y: auto; scrollbar-width: thin; }
		.toc .crumb { padding-inline: 12px; }
	}

	.prose { max-width: 70ch; }
	.prose :global(:where(p, ul, ol, pre, .table-scroll, .callout)) { margin: 0 0 18px; }
	.prose :global(h2) { margin: 48px 0 16px; padding-top: 24px; border-top: 1px solid var(--raised); font-size: 26px; line-height: 1.15; letter-spacing: -.015em; }
	.prose :global(h3) { margin: 32px 0 12px; font-size: 19px; line-height: 1.25; }
	.prose :global(.anchor) { margin-left: .35em; color: var(--muted); font-weight: 400; text-decoration: none; opacity: 0; transition: opacity .15s; }
	.prose :global(.anchor:focus-visible) { opacity: 1; }
	@media (hover: hover) and (pointer: fine) {
		.prose :global(:is(h2, h3):hover .anchor) { opacity: 1; }
	}
	@media (hover: none) {
		.prose :global(.anchor) { opacity: .6; }
	}
	.prose :global(a:not(.anchor)) { color: var(--accent); text-underline-offset: 3px; }
	.prose :global(strong) { font-weight: 600; }
	.prose :global(:is(ul, ol)) { padding-left: 1.25em; }
	.prose :global(li + li) { margin-top: 8px; }
	.prose :global(li::marker) { color: var(--muted); }
	.prose :global(:not(pre) > code) { padding: .1em .35em; border-radius: 5px; background: var(--well); overflow-wrap: anywhere; }
	/* In a narrow table a file name breaks at its hyphens, never inside a word. */
	.prose :global(td code) { overflow-wrap: normal; }
	.prose :global(pre) { padding: 14px 18px; overflow-x: auto; border-radius: 14px; background: var(--surface); line-height: 1.6; scrollbar-width: thin; }
	.prose :global(.table-scroll) { overflow-x: auto; border-radius: 14px; background: var(--surface); }
	.prose :global(table) { width: 100%; border-collapse: collapse; font-size: var(--fs-small); line-height: 1.5; }
	.prose :global(:is(th, td)) { padding: 10px 14px; text-align: left; vertical-align: top; border-bottom: 1px solid var(--raised); }
	.prose :global(tr:last-child > td) { border-bottom: 0; }
	.prose :global(th) { font-weight: 600; }
	.prose :global(.callout) { --tone: var(--accent); padding: 16px 20px; border-radius: 14px; background: color-mix(in oklab, var(--tone) 10%, var(--surface)); box-shadow: inset 3px 0 0 var(--tone); }
	.prose :global(.callout-tip) { --tone: var(--lime); }
	.prose :global(.callout-warning) { --tone: #ff8a65; }
	.prose :global(.callout > p) { margin: 0; }
	.prose :global(.callout > p + p) { margin-top: 8px; }
	.prose :global(.callout-label) { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--tone); }
</style>
