import type { AttributeDefinition, Category, PricingModel, Vertical } from '$lib/types/index.js';

export interface FilterState {
	vertical: Vertical | null;
	category: Category | null;
	region: string | null;
	apiType: string | null;
	pricingModel: PricingModel | null;
	hasPublicApi: boolean | null;
	/** Dynamic attribute filters keyed by AttributeDefinition.key */
	attributes: Record<string, string | string[] | boolean>;
}

function emptyState(): FilterState {
	return {
		vertical: null,
		category: null,
		region: null,
		apiType: null,
		pricingModel: null,
		hasPublicApi: null,
		attributes: {}
	};
}

/**
 * Central filter store for the public tool directory.
 *
 * Rules:
 * - When vertical changes, attribute filters and category are reset.
 * - URL synchronisation is the responsibility of the consuming component
 *   via SvelteKit's goto() with { replaceState: true }.
 *
 * Usage:
 *   filterStore.setVertical(vertical)
 *   filterStore.setAttribute('chains', ['Ethereum', 'Solana'])
 *   filterStore.reset()
 */
class FilterStore {
	state: FilterState = $state(emptyState());

	/** The attribute definitions for the currently selected vertical.
	 *  Set by the page after fetching from the API. */
	attributeDefinitions: AttributeDefinition[] = $state([]);

	setVertical(vertical: Vertical | null): void {
		this.state = {
			...emptyState(),
			vertical
		};
		this.attributeDefinitions = vertical?.attribute_definitions ?? [];
	}

	setCategory(category: Category | null): void {
		this.state.category = category;
	}

	setRegion(region: string | null): void {
		this.state.region = region;
	}

	setApiType(apiType: string | null): void {
		this.state.apiType = apiType;
	}

	setPricingModel(pricingModel: PricingModel | null): void {
		this.state.pricingModel = pricingModel;
	}

	setHasPublicApi(value: boolean | null): void {
		this.state.hasPublicApi = value;
	}

	setAttribute(key: string, value: string | string[] | boolean | null): void {
		if (value === null) {
			const { [key]: _, ...rest } = this.state.attributes;
			this.state.attributes = rest;
		} else {
			this.state.attributes = { ...this.state.attributes, [key]: value };
		}
	}

	reset(): void {
		this.state = emptyState();
		this.attributeDefinitions = [];
	}

	/** Serialise to URL search params for goto() / replaceState */
	toSearchParams(): URLSearchParams {
		const params = new URLSearchParams();
		const s = this.state;

		if (s.vertical) params.set('vertical', s.vertical.slug);
		if (s.category) params.set('category', s.category.slug);
		if (s.region) params.set('region', s.region);
		if (s.apiType) params.set('api_type', s.apiType);
		if (s.pricingModel) params.set('pricing', s.pricingModel);
		if (s.hasPublicApi !== null) params.set('api', String(s.hasPublicApi));

		for (const [key, value] of Object.entries(s.attributes)) {
			if (Array.isArray(value)) {
				params.set(key, value.join(','));
			} else {
				params.set(key, String(value));
			}
		}

		return params;
	}

	/** Hydrate from URL search params (called in page load or effect) */
	fromSearchParams(params: URLSearchParams, verticals: Vertical[]): void {
		const verticalSlug = params.get('vertical');
		const vertical = verticalSlug ? (verticals.find((v) => v.slug === verticalSlug) ?? null) : null;

		// Reset and re-apply so attribute defs match the new vertical
		this.setVertical(vertical);

		const categorySlug = params.get('category');
		if (categorySlug && vertical) {
			const category = vertical.categories.find((c) => c.slug === categorySlug) ?? null;
			this.state.category = category;
		}

		this.state.region = params.get('region');
		this.state.apiType = params.get('api_type');
		this.state.pricingModel = (params.get('pricing') as PricingModel | null) ?? null;
		const apiParam = params.get('api');
		this.state.hasPublicApi = apiParam !== null ? apiParam === 'true' : null;

		// Hydrate dynamic attribute filters from remaining params
		const knownParams = new Set(['vertical', 'category', 'region', 'api_type', 'pricing', 'api']);
		for (const [key, value] of params.entries()) {
			if (knownParams.has(key)) continue;
			const def = this.attributeDefinitions.find((d) => d.key === key);
			if (!def) continue;

			if (def.value_type === 'multi_select') {
				this.state.attributes[key] = value.split(',').filter(Boolean);
			} else if (def.value_type === 'boolean') {
				this.state.attributes[key] = value === 'true';
			} else {
				this.state.attributes[key] = value;
			}
		}
	}

	get hasActiveFilters(): boolean {
		const s = this.state;
		return (
			s.vertical !== null ||
			s.category !== null ||
			s.region !== null ||
			s.apiType !== null ||
			s.pricingModel !== null ||
			s.hasPublicApi !== null ||
			Object.keys(s.attributes).length > 0
		);
	}
}

export const filterStore = new FilterStore();
