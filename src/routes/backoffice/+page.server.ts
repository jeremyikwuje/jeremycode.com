import { getDashboardMetrics } from '$lib/api/index.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const verticalId = url.searchParams.get('vertical') ?? undefined;

	const metrics = await getDashboardMetrics(fetch, verticalId).catch(() => ({
		total_published_tools: 0,
		tools_by_vertical: [],
		pending_submissions: 0,
		tools_added_this_month: 0,
		expert_take_coverage_rate: 0
	}));

	return { metrics, activeVerticalId: verticalId ?? null };
};
