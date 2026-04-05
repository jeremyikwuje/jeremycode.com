import { fail } from '@sveltejs/kit';
import {
	adminGetExpertTakes,
	adminCreateExpertTake,
	adminUpdateExpertTake,
	adminDeleteExpertTake,
	adminGetExperts,
	adminGetTools,
	adminGetVerticals
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const expertId = url.searchParams.get('expert') ?? undefined;
	const verticalId = url.searchParams.get('vertical') ?? undefined;
	const page = Number(url.searchParams.get('page') ?? 1);

	const [result, experts, verticals, toolsResult] = await Promise.all([
		adminGetExpertTakes(fetch, { expert_id: expertId, vertical_id: verticalId, page, per_page: 20 }),
		adminGetExperts(fetch),
		adminGetVerticals(fetch),
		adminGetTools(fetch, { per_page: 200 }) // for tool selector in modal
	]);

	return {
		takes: result.data,
		total: result.total,
		currentPage: result.page,
		perPage: result.per_page,
		experts,
		verticals,
		tools: toolsResult.data,
		filters: { expertId, verticalId }
	};
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();

		const payload = {
			tool_id: fd.get('tool_id')?.toString() ?? '',
			expert_id: fd.get('expert_id')?.toString() ?? '',
			content: fd.get('content')?.toString().trim() ?? '',
			verified: fd.get('verified') === 'on'
		};

		if (!payload.tool_id || !payload.expert_id || !payload.content) {
			return fail(422, { error: 'Tool, expert, and content are required' });
		}

		try {
			await adminCreateExpertTake(fetch, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminUpdateExpertTake(fetch, id, {
				content: fd.get('content')?.toString().trim() ?? '',
				verified: fd.get('verified') === 'on'
			});
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminDeleteExpertTake(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
