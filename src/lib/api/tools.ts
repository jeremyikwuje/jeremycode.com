import type { Tool, PaginatedResponse, AttributeValue } from '$lib/types/index.js';
import type { ToolFilters } from '$lib/types/api.js';
import { apiGet, normalizePaginated } from './client.js';
import type { ApiFetch } from './client.js';

/**
 * Flatten ToolFilters into query-param-friendly flat object.
 * Dynamic attribute filters are serialised as comma-separated values.
 */
function flattenFilters(
	filters: ToolFilters
): Record<string, string | number | boolean | undefined | null> {
	const { attributes, ...rest } = filters;
	const flat: Record<string, string | number | boolean | undefined | null> = { ...rest };

	if (attributes) {
		for (const [key, value] of Object.entries(attributes)) {
			if (Array.isArray(value)) {
				flat[`attr_${key}`] = value.join(',');
			} else {
				flat[`attr_${key}`] = value;
			}
		}
	}

	return flat;
}

/**
 * Normalise a raw tool object from the API into our Tool shape.
 * Handles: attribute array → Record, sdk_languages array → string[],
 * tags → secondary_tags, date_added → created_at, etc.
 */
function normaliseTool(raw: Record<string, unknown>): Tool {
	const tool = { ...raw } as Record<string, unknown>;

	// Map attribute array to Record<string, AttributeValue>
	if (Array.isArray(tool.attributes)) {
		const attrs: Record<string, AttributeValue> = {};
		for (const a of tool.attributes as Array<{ attribute_key?: string; key?: string; attribute_value?: string; value?: string }>) {
			const key = a.attribute_key ?? a.key ?? '';
			const val = a.attribute_value ?? a.value ?? '';
			if (!key) continue;
			if (key in attrs) {
				const existing = attrs[key];
				attrs[key] = Array.isArray(existing) ? [...existing, val] : [existing as string, val];
			} else {
				attrs[key] = val;
			}
		}
		tool.attributes = attrs;
	} else if (!tool.attributes) {
		tool.attributes = {};
	}

	// Map sdk_languages from { language: string }[] to string[]
	if (Array.isArray(tool.sdk_languages) && tool.sdk_languages.length > 0 && typeof tool.sdk_languages[0] === 'object') {
		tool.sdk_languages = (tool.sdk_languages as Array<{ language: string }>).map((s) => s.language);
	} else if (!tool.sdk_languages) {
		tool.sdk_languages = [];
	}

	// Map tags to secondary_tags
	if (Array.isArray(tool.tags) && !tool.secondary_tags) {
		tool.secondary_tags = (tool.tags as Array<{ name?: string; slug?: string }>).map((t) => t.name ?? t.slug ?? '');
		delete tool.tags;
	}
	if (!tool.secondary_tags) tool.secondary_tags = [];

	// Map date fields
	if (tool.date_added && !tool.created_at) {
		tool.created_at = tool.date_added;
		delete tool.date_added;
	}
	if (tool.date_updated && !tool.updated_at) {
		tool.updated_at = tool.date_updated;
		delete tool.date_updated;
	}

	// Ensure nested arrays exist
	if (!tool.expert_takes) tool.expert_takes = [];
	if (!tool.regions) tool.regions = [];

	return tool as unknown as Tool;
}

/**
 * Returns a paginated list of published tools.
 * All filtering, including dynamic vertical attribute filters, is server-side.
 */
export async function getTools(
	fetch: ApiFetch,
	filters: ToolFilters = {}
): Promise<PaginatedResponse<Tool>> {
	const raw = await apiGet<unknown>('/v1/tools', fetch, flattenFilters(filters));
	const paginated = normalizePaginated<Record<string, unknown>>(raw);
	return {
		...paginated,
		data: paginated.data.map(normaliseTool)
	};
}

/**
 * Convenience: fetch all published tools without pagination (for Fuse.js index).
 * Only fetches fields needed for search to keep payload small.
 */
export async function getAllToolsForSearch(fetch: ApiFetch): Promise<Tool[]> {
	const raw = await apiGet<unknown>('/v1/tools', fetch, {
		per_page: 500,
		page: 1
	});
	const paginated = normalizePaginated<Record<string, unknown>>(raw);
	return paginated.data.map(normaliseTool);
}

/**
 * Returns a single tool by slug with all relationships:
 * vertical, category, dynamic attributes, expert takes (each with expert profile),
 * and related tools.
 */
export async function getTool(slug: string, fetch: ApiFetch): Promise<Tool> {
	const raw = await apiGet<Record<string, unknown>>(`/v1/tools/${slug}`, fetch);
	// API returns { tool: {...}, related: [...] } — extract the tool
	const toolData = (raw.tool ?? raw) as Record<string, unknown>;
	return normaliseTool(toolData);
}

/**
 * Returns featured tools across all verticals (up to 9 slots).
 */
export async function getFeaturedTools(fetch: ApiFetch): Promise<Tool[]> {
	const raw = await apiGet<unknown>('/v1/tools', fetch, {
		featured: true,
		per_page: 9
	});
	const paginated = normalizePaginated<Record<string, unknown>>(raw);
	return paginated.data.map(normaliseTool);
}
