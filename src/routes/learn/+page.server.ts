import { getLearnContent } from '$lib/api/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url, parent }) => {
	const { verticals } = await parent();

	const vertical = url.searchParams.get('vertical') ?? undefined;

	const learnResponse = await getLearnContent(fetch, {
		vertical,
		per_page: 24
	}).catch(() => ({ data: [], total: 0, page: 1, per_page: 24 }));

	return {
		learn: learnResponse.data,
		total: learnResponse.total,
		verticals,
		activeVerticalSlug: vertical ?? null
	};
};
