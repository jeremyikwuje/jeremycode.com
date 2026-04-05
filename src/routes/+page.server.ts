import { getFeaturedTools } from '$lib/api/index.js';
import { getLearnContent } from '$lib/api/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { verticals } = await parent();

	const [featuredTools, learnContent] = await Promise.all([
		getFeaturedTools(fetch).catch(() => []),
		getLearnContent(fetch, { per_page: 4 }).catch(() => ({ data: [], total: 0, page: 1, per_page: 4 }))
	]);

	return {
		verticals,
		featuredTools,
		learnContent: learnContent.data
	};
};
