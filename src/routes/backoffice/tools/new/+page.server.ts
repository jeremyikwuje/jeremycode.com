import { fail, redirect } from '@sveltejs/kit';
import { adminGetVerticals, adminCreateTool, getRegions } from '$lib/api/index.js';
import { parseToolFormData } from '$lib/api/tool-form.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch }) => {
	const [verticals, regions] = await Promise.all([
		adminGetVerticals(fetch),
		getRegions(fetch)
	]);

	return { verticals, regions };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const fd = await request.formData();
		const payload = parseToolFormData(fd);

		if (!payload.name) return fail(422, { error: 'Name is required' });
		if (!payload.vertical_id) return fail(422, { error: 'Vertical is required' });
		if (!payload.category_id) return fail(422, { error: 'Category is required' });
		if (!payload.website_url) return fail(422, { error: 'Website URL is required' });

		try {
			const tool = await adminCreateTool(fetch, payload);
			redirect(303, `/backoffice/tools/${tool.id}/edit`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 303) {
				throw err; // re-throw redirects
			}
			return fail(400, { error: String(err) });
		}
	}
};
