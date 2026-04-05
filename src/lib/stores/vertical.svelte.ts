import type { Vertical } from '$lib/types/index.js';

/**
 * Holds the list of active verticals fetched once on the root layout load.
 * Components read this to render GlobalNav and VerticalNav without refetching.
 *
 * Usage:
 *   import { verticalStore } from '$lib/stores/vertical.svelte.js';
 *   // In root +layout.svelte, call verticalStore.set(data.verticals)
 *   // In any component, read verticalStore.items
 */
class VerticalStore {
	items: Vertical[] = $state([]);

	set(verticals: Vertical[]): void {
		this.items = verticals;
	}

	get active(): Vertical[] {
		return this.items.filter((v) => v.is_active);
	}

	bySlug(slug: string): Vertical | undefined {
		return this.items.find((v) => v.slug === slug);
	}
}

export const verticalStore = new VerticalStore();
