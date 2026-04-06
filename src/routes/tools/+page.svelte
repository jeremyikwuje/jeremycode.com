<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { filterStore, uiStore } from '$lib/stores/index.js';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import FilterPanel from '$lib/components/filters/FilterPanel.svelte';
	import FilterDrawer from '$lib/components/filters/FilterDrawer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// Track whether we're syncing FROM URL → store (to avoid circular goto)
	let syncing = false;

	// Hydrate filterStore from URL whenever search params change
	$effect(() => {
		syncing = true;
		filterStore.fromSearchParams(page.url.searchParams, data.verticals);
		// Use tick to ensure the sync flag is cleared after the store-watching effect runs
		queueMicrotask(() => { syncing = false; });
	});

	// Sync filter changes back to URL (only from user interaction, not URL hydration)
	$effect(() => {
		void filterStore.state;
		if (syncing) return;
		const params = filterStore.toSearchParams();
		const qs = params.toString();
		goto(`/tools${qs ? `?${qs}` : ''}`, { replaceState: true, keepFocus: true, noScroll: true });
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
			       text-[--color-text-muted] hover:text-[--color-text] transition-colors"
			style="background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-button);"
			onmouseenter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)')}
			onmouseleave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-subtle)')}
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
			<div class="flex items-center justify-between mb-4 pb-3" style="border-bottom: 1px solid var(--color-border-subtle);">
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
				<div class="flex flex-col gap-3" aria-live="polite" aria-label="Tool results">
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
							class="h-9 px-3 text-sm text-[--color-text-muted]
							       disabled:opacity-40 disabled:pointer-events-none transition-colors"
							style="background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-button);"
							onmouseenter={(e) => !(e.currentTarget as HTMLButtonElement).disabled && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)')}
							onmouseleave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-subtle)')}
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
							class="h-9 px-3 text-sm text-[--color-text-muted]
							       disabled:opacity-40 disabled:pointer-events-none transition-colors"
							style="background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-button);"
							onmouseenter={(e) => !(e.currentTarget as HTMLButtonElement).disabled && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)')}
							onmouseleave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border-subtle)')}
						>
							Next
						</button>
					</nav>
				{/if}
			{:else}
				<EmptyState
					title="No tools found"
					description="Try adjusting your filters or browse all verticals."
				>
					<Button variant="ghost" onclick={() => filterStore.reset()}>
						Clear all filters
					</Button>
				</EmptyState>
			{/if}
		</div>
	</div>
</div>

<!-- Mobile filter drawer -->
<FilterDrawer verticals={data.verticals} regions={data.regions} />
