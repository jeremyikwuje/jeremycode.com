import { fail } from '@sveltejs/kit';
import {
	adminGetComparisons,
	adminCreateComparison,
	adminUpdateComparison,
	adminDeleteComparison,
	adminGetTools
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch }) => {
	const [result, toolsResult] = await Promise.all([
		adminGetComparisons(fetch),
		adminGetTools(fetch, { status: 'published', per_page: 200 })
	]);

	return { comparisons: result.data, total: result.total, tools: toolsResult.data };
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();
		const tool_a_id = fd.get('tool_a_id')?.toString() ?? '';
		const tool_b_id = fd.get('tool_b_id')?.toString() ?? '';

		if (!tool_a_id || !tool_b_id) return fail(422, { error: 'Select both tools' });
		if (tool_a_id === tool_b_id) return fail(422, { error: 'Select two different tools' });

		try {
			await adminCreateComparison(fetch, { tool_a_id, tool_b_id });
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminDeleteComparison(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
