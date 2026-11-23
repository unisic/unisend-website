/*
 * Every page under /docs is a Markdown file in content/docs/*.md with front matter (title,
 * description, order, group). Vite inlines the files at build time and the pages are prerendered,
 * so Markdown never reaches the browser. To add or edit a page, touch the Markdown.
 */
import { Marked } from 'marked';

/** @typedef {{ slug: string, title: string, description: string, order: number, group: string }} DocMeta */
/** @typedef {{ id: string, text: string, depth: number }} TocEntry */

const FILES = /** @type {Record<string, string>} */ (
	import.meta.glob('/content/docs/*.md', { query: '?raw', import: 'default', eager: true })
);

/* The front matter is flat `key: "string"` or `key: number`, so it is read by hand instead of
   pulling in a YAML parser. Anything else fails the build rather than rendering a wrong page. */
const FRONT = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;

/** @param {string} file @param {string} raw */
function split(file, raw) {
	const m = FRONT.exec(raw);
	if (!m) throw new Error(`${file}: no front matter`);
	/** @type {Record<string, string | number>} */
	const data = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^(\w+):\s*(.+?)\s*$/.exec(line);
		const value = kv && (kv[2].startsWith('"') ? JSON.parse(kv[2]) : Number(kv[2]));
		if (!kv || (typeof value === 'number' && Number.isNaN(value))) {
			throw new Error(`${file}: cannot read front matter line "${line}"`);
		}
		data[kv[1]] = value;
	}
	return { data, content: raw.slice(m[0].length) };
}

const SOURCES = Object.entries(FILES)
	.map(([file, raw]) => {
		const slug = file.slice(file.lastIndexOf('/') + 1, -'.md'.length);
		const { data, content } = split(file, raw);
		/** @type {DocMeta} */
		const meta = {
			slug,
			title: String(data.title ?? slug),
			description: String(data.description ?? ''),
			order: Number(data.order ?? 999),
			group: String(data.group ?? '')
		};
		return { meta, content };
	})
	.sort((a, b) => a.meta.order - b.meta.order || a.meta.title.localeCompare(b.meta.title));

/* GitHub-style heading slugger. A fresh one per document keeps ids stable and local to their page. */
function makeSlugger() {
	/** @type {Map<string, number>} */
	const seen = new Map();
	/** @param {string} text */
	return (text) => {
		const base =
			text
				.toLowerCase()
				.trim()
				.replace(/<[^>]*>/g, '')
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.replace(/^-+|-+$/g, '') || 'section';
		const n = seen.get(base) ?? 0;
		seen.set(base, n + 1);
		return n === 0 ? base : `${base}-${n}`;
	};
}

/** @param {string} text */
function escapeAttr(text) {
	return text.replace(/&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Pages are served as /docs/install/ (trailingSlash in routes/docs), so nginx finds their
   index.html. Markdown is written without the slash; every root-relative page link gets it here. */
/** @param {string} href */
function withTrailingSlash(href) {
	if (!href.startsWith('/')) return href;
	const url = new URL(href, 'http://site');
	if (!url.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname += '/';
	return `${url.pathname}${url.search}${url.hash}`;
}

/** @param {string} md */
function renderMarkdown(md) {
	const slug = makeSlugger();
	const engine = new Marked({
		renderer: {
			heading(token) {
				const id = slug(token.text);
				const inner = this.parser.parseInline(token.tokens);
				const anchor = token.depth === 2 || token.depth === 3 ? `<a class="anchor" href="#${id}" aria-label="Link to this section">#</a>` : '';
				return `<h${token.depth} id="${id}">${inner}${anchor}</h${token.depth}>\n`;
			},
			blockquote(token) {
				/* GitHub alert syntax: a first line of [!NOTE], [!TIP] or [!WARNING] makes a callout. */
				const body = this.parser.parse(token.tokens);
				const m = /^<p>\[!(NOTE|TIP|WARNING)\]\s*/.exec(body);
				if (!m) return false;
				const label = m[1][0] + m[1].slice(1).toLowerCase();
				let rest = body.slice(m[0].length);
				rest = rest.startsWith('</p>') ? rest.slice(4).trimStart() : `<p>${rest}`;
				return `<div class="callout callout-${m[1].toLowerCase()}"><p class="callout-label">${label}</p>${rest}</div>\n`;
			},
			link(token) {
				token.href = withTrailingSlash(token.href);
				if (!/^https?:\/\//.test(token.href)) return false;
				const inner = this.parser.parseInline(token.tokens);
				return `<a href="${escapeAttr(token.href)}" rel="noopener noreferrer" class="ext">${inner}</a>`;
			}
		}
	});
	// Tables scroll inside their own box on narrow screens instead of widening the page.
	return /** @type {string} */ (engine.parse(md)).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
}

/* Slugs every heading in document order, as renderMarkdown does, so the ids line up. */
/** @param {string} md */
function buildToc(md) {
	const slug = makeSlugger();
	/** @type {TocEntry[]} */
	const toc = [];
	for (const token of new Marked().lexer(md)) {
		if (token.type !== 'heading') continue;
		const id = slug(token.text);
		if (token.depth === 2 || token.depth === 3) toc.push({ id, text: token.text.replace(/[`*_]/g, ''), depth: token.depth });
	}
	return toc;
}

export function getAllDocs() {
	return SOURCES.map((s) => s.meta);
}

/** Pages bucketed by `group`, groups in first-seen order. */
export function getDocGroups() {
	/** @type {{ group: string, docs: DocMeta[] }[]} */
	const groups = [];
	for (const doc of getAllDocs()) {
		let bucket = groups.find((g) => g.group === doc.group);
		if (!bucket) groups.push((bucket = { group: doc.group, docs: [] }));
		bucket.docs.push(doc);
	}
	return groups;
}

/** @param {string} slug */
export function getDoc(slug) {
	const source = SOURCES.find((s) => s.meta.slug === slug);
	if (!source) return null;
	return { ...source.meta, html: renderMarkdown(source.content), toc: buildToc(source.content) };
}
