import { error } from '@sveltejs/kit';
import { getUseCase } from '$lib/api/content.js';
import { getTools } from '$lib/api/tools.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	let useCase;
	try {
		useCase = await getUseCase(params.use_case, fetch);
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			error(404, { message: `Use case "${params.use_case}" not found` });
		}
		throw err;
	}

	// Use-case tools span all verticals — no vertical filter applied
	const toolsResponse = await getTools(fetch, {
		use_case: params.use_case,
		per_page: 24
	} as Record<string, unknown>).catch(() => ({ data: [], total: 0, page: 1, per_page: 24 }));

	return {
		useCase,
		tools: toolsResponse.data,
		totalTools: toolsResponse.total
	};
};
