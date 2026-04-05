import type { LearnContent, Region, UseCase, Comparison } from '$lib/types/index.js';
import type { PaginatedResponse } from '$lib/types/api.js';
import { apiGet, normalizePaginated } from './client.js';
import type { ApiFetch } from './client.js';

export interface LearnFilters {
	vertical?: string;
	topic?: string;
	page?: number;
	per_page?: number;
}

/** Normalise learn content from API shape to our type. */
function normaliseLearnContent(raw: Record<string, unknown>): LearnContent {
	const lc = { ...raw } as Record<string, unknown>;
	// Map API fields to our type
	if (lc.source_type && !lc.source) {
		lc.source = lc.source_type;
		delete lc.source_type;
	}
	if (Array.isArray(lc.tools) && !lc.associated_tools) {
		lc.associated_tools = lc.tools;
		delete lc.tools;
	}
	if (Array.isArray(lc.verticals) && !lc.associated_verticals) {
		lc.associated_verticals = lc.verticals;
		delete lc.verticals;
	}
	if (!lc.associated_tools) lc.associated_tools = [];
	if (!lc.associated_verticals) lc.associated_verticals = [];
	return lc as unknown as LearnContent;
}

export async function getLearnContent(
	fetch: ApiFetch,
	filters: LearnFilters = {}
): Promise<PaginatedResponse<LearnContent>> {
	const raw = await apiGet<unknown>('/v1/learn', fetch, filters as Record<string, unknown>);
	const paginated = normalizePaginated<Record<string, unknown>>(raw);
	return {
		...paginated,
		data: paginated.data.map(normaliseLearnContent)
	};
}

export async function getRegions(fetch: ApiFetch): Promise<Region[]> {
	const raw = await apiGet<Region[]>('/v1/regions', fetch);
	return Array.isArray(raw) ? raw : [];
}

export async function getRegion(slug: string, fetch: ApiFetch): Promise<Region> {
	return apiGet<Region>(`/v1/regions/${slug}`, fetch);
}

export async function getUseCases(fetch: ApiFetch): Promise<UseCase[]> {
	const raw = await apiGet<UseCase[]>('/v1/use-cases', fetch);
	return Array.isArray(raw) ? raw : [];
}

export async function getUseCase(slug: string, fetch: ApiFetch): Promise<UseCase> {
	return apiGet<UseCase>(`/v1/use-cases/${slug}`, fetch);
}

export async function getComparison(slug: string, fetch: ApiFetch): Promise<Comparison> {
	return apiGet<Comparison>(`/v1/comparisons/${slug}`, fetch);
}
