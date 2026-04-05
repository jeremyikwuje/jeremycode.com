import { error } from '@sveltejs/kit';
import { getTool } from '$lib/api/index.js';
import { ApiRequestError } from '$lib/api/client.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, fetch }) => {
	try {
		const tool = await getTool(params.slug, fetch);
		return { tool };
	} catch (err) {
		if (err instanceof ApiRequestError && err.status === 404) {
			error(404, { message: `Tool "${params.slug}" not found` });
		}
		throw err;
	}
};
