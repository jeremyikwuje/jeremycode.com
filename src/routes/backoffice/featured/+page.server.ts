import { fail } from '@sveltejs/kit';
import {
	adminGetFeaturedTools,
	adminSaveFeaturedTools,
	adminGetTools
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch }) => {
	const [featured, allToolsResult] = await Promise.all([
		adminGetFeaturedTools(fetch),
		adminGetTools(fetch, { status: 'published', per_page: 200 })
	]);

	return { featured, allTools: allToolsResult.data };
};

export const actions: Actions = {
	save: async ({ request, fetch }) => {
		const fd = await request.formData();
		const idsRaw = fd.get('ordered_ids')?.toString() ?? '';
		const ids = idsRaw ? idsRaw.split(',').filter(Boolean) : [];

		if (ids.length > 9) return fail(422, { error: 'Maximum 9 featured tools' });

		try {
			await adminSaveFeaturedTools(fetch, ids);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
