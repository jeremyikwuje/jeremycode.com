import {
	adminGetTools,
	adminGetVerticals,
	adminPatchTool,
	adminDeleteTool
} from '$lib/api/index.js';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const verticalId = url.searchParams.get('vertical') ?? undefined;
	const status = url.searchParams.get('status') as 'published' | 'draft' | undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const page = Number(url.searchParams.get('page') ?? 1);

	const [toolsResult, verticals] = await Promise.all([
		adminGetTools(fetch, {
			vertical_id: verticalId,
			status,
			search,
			page,
			per_page: 25
		}),
		adminGetVerticals(fetch)
	]);

	return {
		tools: toolsResult.data,
		totalTools: toolsResult.total,
		currentPage: toolsResult.page,
		perPage: toolsResult.per_page,
		verticals,
		filters: { verticalId, status, search }
	};
};

export const actions: Actions = {
	togglePublish: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';
		const is_published = fd.get('is_published') === 'true';

		try {
			await adminPatchTool(fetch, id, { is_published });
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch, locals }) => {
		if (locals.adminUser?.role !== 'super_admin') {
			return fail(403, { error: 'Super admin required' });
		}

		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminDeleteTool(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
