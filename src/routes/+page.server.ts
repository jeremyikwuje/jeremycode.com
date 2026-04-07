import { getTools, getFeaturedTools } from '$lib/api/index.js';
import { getLearnContent } from '$lib/api/content.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { verticals } = await parent();

	const empty = { data: [], total: 0, page: 1, per_page: 20 };

	const [recentTools, featuredTools, learnContent] = await Promise.all([
		getTools(fetch, { per_page: 20 }).catch(() => empty),
		getFeaturedTools(fetch).catch(() => []),
		getLearnContent(fetch, { per_page: 4 }).catch(() => ({ data: [], total: 0, page: 1, per_page: 4 }))
	]);

	// Split recent tools into "new this week" vs "last week" by created_at
	const now = Date.now();
	const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
	const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;

	const newThisWeek = recentTools.data.filter(
		(t) => new Date(t.created_at).getTime() >= oneWeekAgo
	);
	const lastWeek = recentTools.data.filter((t) => {
		const ts = new Date(t.created_at).getTime();
		return ts >= twoWeeksAgo && ts < oneWeekAgo;
	});

	// If date-based splits are empty (API doesn't have created_at or all tools
	// are older), fall back to simple index-based splits
	const allTools = recentTools.data;
	const sectionNewThisWeek = newThisWeek.length > 0 ? newThisWeek : allTools.slice(0, 10);
	const sectionLastWeek = lastWeek.length > 0 ? lastWeek : allTools.slice(10, 20);

	return {
		verticals,
		newThisWeek: sectionNewThisWeek,
		popularTools: featuredTools,
		lastWeekTools: sectionLastWeek,
		learnContent: learnContent.data,
		totalTools: recentTools.total
	};
};
