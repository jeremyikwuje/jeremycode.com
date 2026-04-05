import { error } from '@sveltejs/kit';
import { getVertical } from '$lib/api/index.js';
import { getTools } from '$lib/api/tools.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	let vertical;
	try {
		vertical = await getVertical(params.vertical, fetch);
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			error(404, { message: 'Page not found' });
		}
		throw err;
	}

	const category = vertical.categories.find((c) => c.slug === params.category);
	if (!category) {
		error(404, {
			message: `Category "${params.category}" not found in ${vertical.name}`
		});
	}

	const toolsResponse = await getTools(fetch, {
		vertical: params.vertical,
		category: params.category,
		per_page: 24
	}).catch(() => ({ data: [], total: 0, page: 1, per_page: 24 }));

	return {
		vertical,
		category,
		tools: toolsResponse.data,
		totalTools: toolsResponse.total
	};
};
