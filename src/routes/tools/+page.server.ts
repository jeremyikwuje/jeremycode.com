import { getTools } from '$lib/api/index.js';
import { getRegions } from '$lib/api/content.js';
import type { ToolFilters } from '$lib/types/api.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url, parent }) => {
	const { verticals } = await parent();

	// Build filters from URL search params
	const filters: ToolFilters = {};
	const v = url.searchParams.get('vertical');
	if (v) filters.vertical = v;
	const cat = url.searchParams.get('category');
	if (cat) filters.category = cat;
	const region = url.searchParams.get('region');
	if (region) filters.region = region;
	const apiType = url.searchParams.get('api_type');
	if (apiType) filters.api_type = apiType;
	const pricing = url.searchParams.get('pricing');
	if (pricing) filters.pricing_model = pricing;
	const api = url.searchParams.get('api');
	if (api === 'true') filters.has_public_api = true;
	const search = url.searchParams.get('search');
	if (search) filters.search = search;
	const pg = url.searchParams.get('page');
	if (pg) filters.page = parseInt(pg, 10);

	// Dynamic attribute filters: any param matching a known attribute key
	// is forwarded. The vertical's attribute definitions tell us which keys
	// are valid, but we also pass unknown keys through — the API ignores
	// unrecognised params.
	const knownParams = new Set([
		'vertical', 'category', 'region', 'api_type', 'pricing', 'api', 'search', 'page'
	]);
	const attrFilters: Record<string, string[]> = {};
	for (const [key, value] of url.searchParams.entries()) {
		if (knownParams.has(key)) continue;
		attrFilters[key] = value.split(',').filter(Boolean);
	}
	if (Object.keys(attrFilters).length > 0) {
		filters.attributes = attrFilters;
	}

	const empty = { data: [], total: 0, page: 1, per_page: 24 };
	const [toolsResponse, regions] = await Promise.all([
		getTools(fetch, filters).catch(() => empty),
		getRegions(fetch).catch(() => [])
	]);

	return {
		tools: toolsResponse.data,
		totalTools: toolsResponse.total,
		currentPage: toolsResponse.page,
		perPage: toolsResponse.per_page,
		verticals,
		regions,
		activeFilters: filters
	};
};
