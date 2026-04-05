import { error, fail, redirect } from '@sveltejs/kit';
import {
	adminGetVerticals,
	adminGetTool,
	adminUpdateTool,
	getRegions
} from '$lib/api/index.js';
import { parseToolFormData } from '$lib/api/tool-form.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const [verticals, regions, tool] = await Promise.all([
		adminGetVerticals(fetch),
		getRegions(fetch),
		adminGetTool(fetch, params.id)
	]);

	if (!tool) error(404, 'Tool not found');

	return { verticals, regions, tool };
};

export const actions: Actions = {
	default: async ({ request, fetch, params }) => {
		const fd = await request.formData();
		const payload = parseToolFormData(fd);

		if (!payload.name) return fail(422, { error: 'Name is required' });
		if (!payload.vertical_id) return fail(422, { error: 'Vertical is required' });
		if (!payload.category_id) return fail(422, { error: 'Category is required' });

		try {
			await adminUpdateTool(fetch, params.id, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
