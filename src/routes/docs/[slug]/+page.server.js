import { error } from '@sveltejs/kit';
import { getAllDocs, getDoc } from '#lib/server/docs.js';

/** @type {import('./$types').EntryGenerator} */
export const entries = () => getAllDocs().map(({ slug }) => ({ slug }));

/** @type {import('./$types').PageServerLoad} */
export const load = ({ params }) => {
	const doc = getDoc(params.slug);
	if (!doc) error(404, 'No such page in the docs');
	const all = getAllDocs();
	const i = all.findIndex((d) => d.slug === doc.slug);
	return { doc, prev: all[i - 1] ?? null, next: all[i + 1] ?? null };
};
