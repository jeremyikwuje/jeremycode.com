import { error } from '@sveltejs/kit';
import { getRegion } from '$lib/api/content.js';
import { getTools } from '$lib/api/tools.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	let region;
	try {
		region = await getRegion(params.slug, fetch);
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			error(404, { message: `Region "${params.slug}" not found` });
		}
		throw err;
	}

	const toolsResponse = await getTools(fetch, {
		region: params.slug,
		per_page: 24
	}).catch(() => ({ data: [], total: 0, page: 1, per_page: 24 }));

	return {
		region,
		tools: toolsResponse.data,
		totalTools: toolsResponse.total
	};
};
