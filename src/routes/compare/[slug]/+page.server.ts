import { error } from '@sveltejs/kit';
import { getComparison } from '$lib/api/content.js';
import { getTool } from '$lib/api/tools.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	// Slug format: tool-a-slug-vs-tool-b-slug
	const match = params.slug.match(/^(.+)-vs-(.+)$/);
	if (!match) {
		error(404, { message: 'Invalid comparison URL' });
	}

	const [slugA, slugB] = [match[1], match[2]];

	// Fetch both tools and the optional admin-created comparison in parallel.
	// The comparison record may not exist — that's fine, we compare anyway.
	const [toolA, toolB, comparison] = await Promise.all([
		getTool(slugA, fetch).catch((err) => {
			if (err instanceof ApiRequestError && err.status === 404) {
				error(404, { message: `Tool "${slugA}" not found` });
			}
			throw err;
		}),
		getTool(slugB, fetch).catch((err) => {
			if (err instanceof ApiRequestError && err.status === 404) {
				error(404, { message: `Tool "${slugB}" not found` });
			}
			throw err;
		}),
		getComparison(params.slug, fetch).catch(() => null)
	]);

	// Attributes shared across both tools for structured comparison.
	// When both tools are in the same vertical we include that vertical's
	// attribute definitions; otherwise only universal fields are compared.
	const sameVertical = toolA.vertical.id === toolB.vertical.id;

	return {
		toolA,
		toolB,
		comparison,
		sameVertical
	};
};
