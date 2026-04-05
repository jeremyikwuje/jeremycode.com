<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const vertical = $derived(data.vertical);
	const accentColor = $derived(vertical.accent_colour ?? 'var(--color-primary)');
	const sortedCategories = $derived(
		[...vertical.categories].sort((a, b) => a.display_order - b.display_order)
	);
</script>

<SeoHead
	title="{vertical.name} Tools for Developers"
	description="{vertical.description} Browse {data.totalTools} {vertical.name.toLowerCase()} tools across {vertical.categories.length} categories."
	canonical="{page.url.origin}/{vertical.slug}"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${vertical.name} Tools Directory`,
		description: vertical.description,
		numberOfItems: data.totalTools,
		itemListElement: data.tools.map((tool, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			url: `${page.url.origin}/tools/${tool.slug}`,
			name: tool.name
		}))
	}}
/>

<!-- Vertical hero -->
<section
	class="border-b border-[--color-border]"
	style="--vertical-color: {accentColor};"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
		<div class="flex items-start gap-4">
			{#if vertical.icon}
				<span class="text-4xl shrink-0">{vertical.icon}</span>
			{/if}
			<div>
				<h1
					class="text-2xl sm:text-4xl font-bold"
					style="color: {accentColor}; font-family: var(--font-display);"
				>
					{vertical.name}
				</h1>
				<p class="mt-3 text-base sm:text-lg text-[--color-text-muted] max-w-2xl leading-relaxed">
					{vertical.description}
				</p>
				<p class="mt-3 text-sm text-[--color-text-muted]">
					{data.totalTools} tool{data.totalTools === 1 ? '' : 's'}
					&middot;
					{vertical.categories.length} categor{vertical.categories.length === 1 ? 'y' : 'ies'}
				</p>
			</div>
		</div>

		<!-- Accent bar -->
		<div
			class="mt-6 h-1 w-24"
			style="background-color: {accentColor}; border-radius: 2px;"
		></div>
	</div>
</section>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
	<!-- Two-column: categories sidebar + tools list -->
	<div class="flex gap-8 items-start">
		<!-- Category sidebar — desktop -->
		{#if sortedCategories.length > 0}
			<aside class="hidden lg:flex flex-col gap-1 w-56 shrink-0 sticky top-24">
				<h2 class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-2">
					Categories
				</h2>
				<a
					href="/tools?vertical={vertical.slug}"
					class="text-left px-2.5 py-1.5 text-sm text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface] transition-colors"
					style="border-radius: var(--radius-button);"
				>
					All {vertical.name} tools
				</a>
				{#each sortedCategories as category (category.id)}
					<a
						href="/{vertical.slug}/{category.slug}"
						class="text-left px-2.5 py-1.5 text-sm text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface] transition-colors"
						style="border-radius: var(--radius-button);"
					>
						{category.name}
						{#if category.tool_count !== undefined}
							<span class="text-xs opacity-60 ml-1">({category.tool_count})</span>
						{/if}
					</a>
				{/each}
			</aside>
		{/if}

		<!-- Tools list -->
		<div class="flex-1 min-w-0">
			<!-- Mobile categories as horizontal pills -->
			{#if sortedCategories.length > 0}
				<nav class="lg:hidden flex flex-wrap gap-2 mb-6" aria-label="Categories">
					{#each sortedCategories as category (category.id)}
						<a
							href="/{vertical.slug}/{category.slug}"
							class="inline-flex items-center h-8 px-3 text-sm font-medium
							       bg-[--color-surface] border border-[--color-border] text-[--color-text-muted]
							       hover:border-[--color-primary] hover:text-[--color-text] transition-colors"
							style="border-radius: var(--radius-button);"
						>
							{category.name}
						</a>
					{/each}
				</nav>
			{/if}

			{#if data.tools.length > 0}
				<div class="flex items-center justify-between mb-5">
					<h2
						class="text-xl font-semibold text-[--color-text]"
						style="font-family: var(--font-display);"
					>
						{vertical.name} Tools
					</h2>
					{#if data.totalTools > data.tools.length}
						<Button href="/tools?vertical={vertical.slug}" variant="ghost" size="sm">
							View all {data.totalTools}
						</Button>
					{/if}
				</div>

				<div class="flex flex-col gap-3">
					{#each data.tools as tool, i (tool.id)}
						<ToolListItem {tool} rank={i + 1} />
					{/each}
				</div>
			{:else}
				<div class="py-16 text-center">
					<p class="text-lg text-[--color-text-muted]">No tools in this vertical yet</p>
					<p class="mt-2 text-sm text-[--color-text-muted]">
						Check back soon or <a href="/submit" class="text-[--color-primary] hover:underline">submit a tool</a>.
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
