<script lang="ts">
	import { page } from '$app/state';
	import ToolCard from '$lib/components/tools/ToolCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchInput from '$lib/components/search/SearchInput.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const activeVerticals = $derived(data.verticals.filter((v) => v.is_active));

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Jeremy Code — Fintech Tools Directory',
			url: page.url.origin,
			description:
				'A curated, searchable directory of fintech infrastructure tools for developers, product teams, and founders.',
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${page.url.origin}/tools?search={search_term_string}`
				},
				'query-input': 'required name=search_term_string'
			}
		},
		...(data.featuredTools.length > 0
			? [
					{
						'@context': 'https://schema.org',
						'@type': 'ItemList',
						name: 'Featured Fintech Tools',
						numberOfItems: data.featuredTools.length,
						itemListElement: data.featuredTools.map((tool, i) => ({
							'@type': 'ListItem',
							position: i + 1,
							url: `${page.url.origin}/tools/${tool.slug}`,
							name: tool.name
						}))
					}
				]
			: [])
	]);
</script>

<SeoHead
	title="Fintech Tools Directory"
	description="A curated, searchable directory of fintech infrastructure tools for developers, product teams, and founders. Compare APIs across stablecoins, payments, KYC, and more."
	canonical="{page.url.origin}/"
	{jsonLd}
/>

<!-- Hero -->
<section class="relative overflow-hidden">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 text-center">
		<h1
			class="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[--color-text]"
			style="font-family: var(--font-display);"
		>
			Find the right
			<span class="text-[--color-primary]">fintech tools</span>
			<br class="hidden sm:block" />
			for what you're building
		</h1>

		<p class="mt-4 sm:mt-6 text-base sm:text-lg text-[--color-text-muted] max-w-2xl mx-auto leading-relaxed">
			A curated directory of fintech infrastructure APIs — stablecoins, payments, KYC, and more.
			Engineer-reviewed, with expert commentary.
		</p>

		<!-- Search trigger -->
		<div class="mt-8 max-w-md mx-auto">
			<SearchInput mode="inline" placeholder="Search tools across all verticals…" />
		</div>

		<!-- Vertical navigation pills -->
		{#if activeVerticals.length > 0}
			<nav class="mt-8 flex flex-wrap justify-center gap-2" aria-label="Browse by vertical">
				<Button href="/tools" variant="ghost" size="sm">All Tools</Button>
				{#each activeVerticals as vertical (vertical.id)}
					{@const color = vertical.accent_colour ?? 'var(--color-primary)'}
					<a
						href="/{vertical.slug}"
						class="inline-flex items-center h-8 px-3 text-sm font-medium transition-colors hover:opacity-80"
						style="
						  border-radius: var(--radius-button);
						  background-color: color-mix(in srgb, {color} 15%, transparent);
						  color: {color};
						"
					>
						{vertical.name}
					</a>
				{/each}
			</nav>
		{/if}
	</div>
</section>

<!-- Featured tools -->
{#if data.featuredTools.length > 0}
	<section class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<div class="flex items-center justify-between mb-6">
			<h2
				class="text-xl sm:text-2xl font-bold text-[--color-text]"
				style="font-family: var(--font-display);"
			>
				Featured Tools
			</h2>
			<Button href="/tools" variant="ghost" size="sm">View all</Button>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each data.featuredTools as tool (tool.id)}
				<ToolCard {tool} />
			{/each}
		</div>
	</section>
{/if}

<!-- Verticals overview -->
{#if activeVerticals.length > 0}
	<section class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<h2
			class="text-xl sm:text-2xl font-bold text-[--color-text] mb-6"
			style="font-family: var(--font-display);"
		>
			Explore by Vertical
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each activeVerticals as vertical (vertical.id)}
				{@const color = vertical.accent_colour ?? 'var(--color-primary)'}
				<Card href="/{vertical.slug}" class="p-5">
					<div class="flex items-start gap-3">
						{#if vertical.icon}
							<span class="text-2xl shrink-0">{vertical.icon}</span>
						{/if}
						<div>
							<h3
								class="text-base font-semibold"
								style="color: {color}; font-family: var(--font-display);"
							>
								{vertical.name}
							</h3>
							<p class="mt-1 text-sm text-[--color-text-muted] line-clamp-2">
								{vertical.description}
							</p>
							<p class="mt-2 text-xs text-[--color-text-muted]">
								{vertical.categories.length} categories
								{#if vertical.tool_count !== undefined}
									&middot; {vertical.tool_count} tools
								{/if}
							</p>
						</div>
					</div>
				</Card>
			{/each}
		</div>
	</section>
{/if}

<!-- Latest from Jeremy (learn content) -->
{#if data.learnContent.length > 0}
	<section class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<div class="flex items-center justify-between mb-6">
			<h2
				class="text-xl sm:text-2xl font-bold text-[--color-text]"
				style="font-family: var(--font-display);"
			>
				Latest from Jeremy
			</h2>
			<Button href="/learn" variant="ghost" size="sm">View all</Button>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each data.learnContent as content (content.id)}
				<Card href={content.url} class="p-4">
					<div class="flex items-center gap-2 mb-2">
						{#if content.source === 'youtube'}
							<span class="text-xs font-medium text-[--color-accent-green]">YouTube</span>
						{:else}
							<span class="text-xs font-medium text-[--color-secondary]">Substack</span>
						{/if}
					</div>
					<h3 class="text-sm font-semibold text-[--color-text] line-clamp-2">
						{content.title}
					</h3>
					{#if content.description}
						<p class="mt-1 text-xs text-[--color-text-muted] line-clamp-2">
							{content.description}
						</p>
					{/if}
				</Card>
			{/each}
		</div>
	</section>
{/if}
