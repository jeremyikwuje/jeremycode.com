import type { Tool } from '$lib/types/index.js';
import type { IFuseOptions, FuseResult } from 'fuse.js';
import type Fuse from 'fuse.js';

/**
 * Client-side Fuse.js search store.
 *
 * Fuse is loaded lazily on first use so it doesn't bloat the initial bundle.
 * The tool list is hydrated once from the server load and never refetched.
 *
 * Usage:
 *   await searchStore.init(tools)   // call once in /tools +page.svelte onMount
 *   searchStore.search('circle')
 *   searchStore.results             // reactive filtered list
 */
const FUSE_OPTIONS: IFuseOptions<Tool> = {
	threshold: 0.3,
	keys: [
		{ name: 'name', weight: 0.4 },
		{ name: 'tagline', weight: 0.3 },
		{ name: 'description', weight: 0.15 },
		{ name: 'secondary_tags', weight: 0.1 },
		{ name: 'vertical.name', weight: 0.025 },
		{ name: 'category.name', weight: 0.025 }
	]
};

class SearchStore {
	query: string = $state('');
	results: Tool[] = $state([]);
	isReady: boolean = $state(false);

	private allTools: Tool[] = [];
	private fuse: Fuse<Tool> | null = null;

	async init(tools: Tool[]): Promise<void> {
		this.allTools = tools;
		const FuseClass = (await import('fuse.js')).default;
		this.fuse = new FuseClass(tools, FUSE_OPTIONS);
		this.isReady = true;
		this.#runSearch();
	}

	search(query: string): void {
		this.query = query;
		this.#runSearch();
	}

	clear(): void {
		this.query = '';
		this.results = this.allTools;
	}

	#runSearch(): void {
		if (!this.fuse) return;
		if (!this.query.trim()) {
			this.results = this.allTools;
			return;
		}
		this.results = this.fuse.search(this.query).map((r) => r.item);
	}
}

export const searchStore = new SearchStore();
