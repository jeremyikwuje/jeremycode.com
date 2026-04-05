import type { Vertical, Category, AttributeDefinition } from '$lib/types/index.js';
import { apiGet } from './client.js';
import type { ApiFetch } from './client.js';

/** Ensure a vertical object always has its nested arrays. */
function normaliseVertical(v: Partial<Vertical>): Vertical {
	return {
		...v,
		categories: v.categories ?? [],
		attribute_definitions: v.attribute_definitions ?? []
	} as Vertical;
}

/**
 * Returns all active verticals, each with their categories.
 * Attribute definitions are NOT included here — fetch them separately
 * when you need to render filter controls.
 */
export async function getVerticals(fetch: ApiFetch): Promise<Vertical[]> {
	const raw = await apiGet<Vertical[]>('/v1/verticals', fetch);
	return (Array.isArray(raw) ? raw : []).map(normaliseVertical);
}

/**
 * Returns a single vertical by slug, with categories and attribute definitions.
 * The API may return a nested `{ vertical, categories, attribute_definitions }`
 * shape — this function normalises it into a flat Vertical object.
 */
export async function getVertical(slug: string, fetch: ApiFetch): Promise<Vertical> {
	const raw = await apiGet<Vertical & { vertical?: Partial<Vertical> }>(
		`/v1/verticals/${slug}`,
		fetch
	);
	// Handle nested response shape: { vertical: {...}, categories: [...], attribute_definitions: [...] }
	if (raw.vertical && typeof raw.vertical === 'object') {
		return normaliseVertical({
			...raw.vertical,
			categories: raw.categories ?? [],
			attribute_definitions: raw.attribute_definitions ?? []
		});
	}
	return normaliseVertical(raw);
}

/**
 * Returns categories scoped to a vertical.
 */
export async function getCategories(verticalSlug: string, fetch: ApiFetch): Promise<Category[]> {
	const raw = await apiGet<Category[]>(`/v1/verticals/${verticalSlug}/categories`, fetch);
	return Array.isArray(raw) ? raw : [];
}

/**
 * Returns all attribute definitions for a vertical.
 * Used by FilterPanel to dynamically render filter controls.
 */
export async function getAttributeDefinitions(
	verticalId: string,
	fetch: ApiFetch
): Promise<AttributeDefinition[]> {
	const raw = await apiGet<AttributeDefinition[]>(
		`/v1/verticals/${verticalId}/attributes`,
		fetch
	);
	return Array.isArray(raw) ? raw : [];
}
