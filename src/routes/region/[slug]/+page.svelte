<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="{data.region.name} Fintech Tools"
	description="{data.region.description ?? `Fintech infrastructure tools operating in ${data.region.name}.`} Browse {data.totalTools} tools across all verticals."
	canonical="{page.url.origin}/region/{data.region.slug}"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${data.region.name} Fintech Tools`,
		numberOfItems: data.totalTools,
		itemListElement: data.tools.map((tool, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			url: `${page.url.origin}/tools/${tool.slug}`,
			name: tool.name
		}))
	}}
/>

<section class="border-b border-[--color-border]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
		<nav class="text-sm text-[--color-text-muted] mb-4" aria-label="Breadcrumb">
			<a href="/tools" class="hover:text-[--color-text] transition-colors">Tools</a>
			<span class="mx-1.5" aria-hidden="true">/</span>
			<span>Regions</span>
			<span class="mx-1.5" aria-hidden="true">/</span>
			<span class="text-[--color-text]">{data.region.name}</span>
		</nav>
		<h1 class="text-2xl sm:text-4xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			{data.region.name}
		</h1>
		{#if data.region.description}
			<p class="mt-3 text-base text-[--color-text-muted] max-w-2xl leading-relaxed">
				{data.region.description}
			</p>
		{/if}
		<p class="mt-2 text-sm text-[--color-text-muted]">
			{data.totalTools} tool{data.totalTools === 1 ? '' : 's'} available
		</p>
	</div>
</section>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
	{#if data.tools.length > 0}
		<div class="flex flex-col gap-3">
			{#each data.tools as tool, i (tool.id)}
				<ToolListItem {tool} rank={i + 1} />
			{/each}
		</div>
		{#if data.totalTools > data.tools.length}
			<div class="flex justify-center mt-8">
				<Button href="/tools?region={data.region.slug}" variant="ghost">
					View all {data.totalTools} tools
				</Button>
			</div>
		{/if}
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-[--color-text-muted]">No tools found for this region yet</p>
			<p class="mt-2 text-sm">
				<a href="/submit" class="text-[--color-primary] hover:underline">Submit a tool</a>
			</p>
		</div>
	{/if}
</div>
