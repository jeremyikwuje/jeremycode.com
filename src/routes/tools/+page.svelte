<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { filterStore, uiStore } from '$lib/stores/index.js';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import FilterPanel from '$lib/components/filters/FilterPanel.svelte';
	import FilterDrawer from '$lib/components/filters/FilterDrawer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Hydrate filterStore from URL on first render
	$effect(() => {
		filterStore.fromSearchParams(page.url.searchParams, data.verticals);
	});

	// Sync filter changes back to URL
	function applyFilters() {
		const params = filterStore.toSearchParams();
		const qs = params.toString();
		goto(`/tools${qs ? `?${qs}` : ''}`, { replaceState: true, keepFocus: true });
	}

	// Re-apply filters when filterStore state changes
	$effect(() => {
		const _ = filterStore.state;
		if (filterStore.hasActiveFilters || page.url.searchParams.size > 0) {
			applyFilters();
		}
	});

	// Pagination helpers
	const totalPages = $derived(Math.ceil(data.totalTools / data.perPage));

	function goToPage(pg: number) {
		const params = new URLSearchParams(page.url.searchParams);
		if (pg > 1) {
			params.set('page', String(pg));
		} else {
			params.delete('page');
		}
		goto(`/tools?${params.toString()}`, { replaceState: true });
	}

	const seoTitle = $derived(
		filterStore.state.vertical ? `${filterStore.state.vertical.name} Tools` : 'All Fintech Tools'
	);
	const seoDesc = $derived(
		filterStore.state.vertical
			? `Browse ${filterStore.state.vertical.name} tools for developers. Filter by category, region, API type, and more.`
			: 'Browse all fintech infrastructure tools. Filter by vertical, category, region, API type, pricing, and vertical-specific attributes.'
	);
	const seoJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: filterStore.state.vertical
			? `${filterStore.state.vertical.name} Tools Directory`
			: 'Fintech Tools Directory',
		numberOfItems: data.totalTools,
		itemListElement: data.tools.map((tool, i) => ({
			'@type': 'ListItem',
			position: (data.currentPage - 1) * data.perPage + i + 1,
			url: `${page.url.origin}/tools/${tool.slug}`,
			name: tool.name
		}))
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDesc}
	canonical="{page.url.origin}/tools"
	jsonLd={seoJsonLd}
	noindex={data.currentPage > 1}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
	<!-- Mobile: filter button -->
	<div class="flex items-center justify-end gap-3 lg:hidden mb-4">
		<button
			type="button"
			onclick={() => uiStore.openFilterDrawer()}
			class="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium
			       bg-[--color-surface] border border-[--color-border] text-[--color-text-muted]
			       hover:border-[--color-primary] hover:text-[--color-text] transition-colors"
			style="border-radius: var(--radius-button);"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="4" y1="21" x2="4" y2="14" />
				<line x1="4" y1="10" x2="4" y2="3" />
				<line x1="12" y1="21" x2="12" y2="12" />
				<line x1="12" y1="8" x2="12" y2="3" />
				<line x1="20" y1="21" x2="20" y2="16" />
				<line x1="20" y1="12" x2="20" y2="3" />
				<line x1="1" y1="14" x2="7" y2="14" />
				<line x1="9" y1="8" x2="15" y2="8" />
				<line x1="17" y1="16" x2="23" y2="16" />
			</svg>
			Filters
		</button>
	</div>

	<!-- Two-column layout: sticky filter sidebar + tool list -->
	<div class="flex gap-8 items-start">
		<!-- Filter sidebar — desktop only -->
		<div class="hidden lg:block w-64 shrink-0 sticky top-24">
			<FilterPanel
				verticals={data.verticals}
				regions={data.regions}
				class="flex max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
			/>
		</div>

		<!-- Tool list -->
		<div class="flex-1 min-w-0">
			<!-- Intro header (PH-style) -->
			<div class="mb-6">
				<h1
					class="text-xl sm:text-2xl font-bold text-[--color-text]"
					style="font-family: var(--font-display);"
				>
					Welcome to Jeremy Code
				</h1>
				<p class="mt-1 text-sm text-[--color-text-muted]">
					The place to discover and find the best stablecoin and fintech tools.
				</p>
			</div>

			<!-- Section heading with count -->
			<div class="flex items-center justify-between mb-4 pb-3 border-b border-[--color-border]">
				<h2
					class="text-base font-semibold text-[--color-text]"
					style="font-family: var(--font-display);"
				>
					{#if filterStore.state.vertical}
						{filterStore.state.vertical.name} Tools
					{:else}
						Top Tools Today
					{/if}
				</h2>
				<span class="text-xs text-[--color-text-muted]">
					{data.totalTools} tool{data.totalTools === 1 ? '' : 's'}
					{#if filterStore.hasActiveFilters}
						matching filters
					{/if}
				</span>
			</div>

			{#if data.tools.length > 0}
				<div class="flex flex-col gap-3">
					{#each data.tools as tool, i (tool.id)}
						<ToolListItem
							{tool}
							rank={(data.currentPage - 1) * data.perPage + i + 1}
						/>
					{/each}
				</div>

				<!-- Pagination -->
				{#if totalPages > 1}
					<nav
						class="flex items-center justify-center gap-2 mt-8"
						aria-label="Pagination"
					>
						<button
							type="button"
							onclick={() => goToPage(data.currentPage - 1)}
							disabled={data.currentPage <= 1}
							class="h-9 px-3 text-sm text-[--color-text-muted] bg-[--color-surface]
							       border border-[--color-border] hover:border-[--color-primary]
							       disabled:opacity-40 disabled:pointer-events-none transition-colors"
							style="border-radius: var(--radius-button);"
						>
							Previous
						</button>

						<span class="text-sm text-[--color-text-muted] px-2">
							Page {data.currentPage} of {totalPages}
						</span>

						<button
							type="button"
							onclick={() => goToPage(data.currentPage + 1)}
							disabled={data.currentPage >= totalPages}
							class="h-9 px-3 text-sm text-[--color-text-muted] bg-[--color-surface]
							       border border-[--color-border] hover:border-[--color-primary]
							       disabled:opacity-40 disabled:pointer-events-none transition-colors"
							style="border-radius: var(--radius-button);"
						>
							Next
						</button>
					</nav>
				{/if}
			{:else}
				<!-- Empty state -->
				<div class="flex flex-col items-center justify-center py-16 text-center">
					<p class="text-lg text-[--color-text-muted] mb-2">No tools found</p>
					<p class="text-sm text-[--color-text-muted] mb-6 max-w-sm">
						Try adjusting your filters or search across all verticals.
					</p>
					<Button variant="ghost" onclick={() => filterStore.reset()}>
						Clear all filters
					</Button>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Mobile filter drawer -->
<FilterDrawer verticals={data.verticals} regions={data.regions} />
