import { error } from '@sveltejs/kit';
import { getVertical } from '$lib/api/index.js';
import { getTools } from '$lib/api/tools.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

// Slugs that are handled by explicit route files and must never fall through
// to the dynamic [vertical] route. SvelteKit prioritises explicit routes, but
// this guard catches edge cases in the load function.
const RESERVED_SLUGS = new Set([
	'about', 'learn', 'submit', 'tools', 'compare', 'region', 'for',
	'backoffice', 'api', 'privacy', 'terms'
]);

export const load: PageServerLoad = async ({ params, fetch }) => {
	if (RESERVED_SLUGS.has(params.vertical)) {
		error(404, { message: 'Page not found' });
	}

	let vertical;
	try {
		vertical = await getVertical(params.vertical, fetch);
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			error(404, { message: `"${params.vertical}" is not a known vertical` });
		}
		throw err;
	}

	// Fetch top tools for this vertical
	const toolsResponse = await getTools(fetch, {
		vertical: params.vertical,
		per_page: 24
	}).catch(() => ({ data: [], total: 0, page: 1, per_page: 24 }));

	return {
		vertical,
		tools: toolsResponse.data,
		totalTools: toolsResponse.total
	};
};
