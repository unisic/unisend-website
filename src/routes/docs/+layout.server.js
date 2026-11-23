import { getDocGroups } from '#lib/server/docs.js';

// Each page is written as docs/<slug>/index.html, which nginx's `try_files $uri $uri/` finds.
export const trailingSlash = 'always';

/** @type {import('./$types').LayoutServerLoad} */
export const load = () => ({ groups: getDocGroups() });
