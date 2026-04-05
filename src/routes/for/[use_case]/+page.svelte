<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();
</script>

<SeoHead
	title="{data.useCase.name} — Fintech Tools"
	description="{data.useCase.description ?? `Fintech tools for ${data.useCase.name}.`} {data.totalTools} tools across all verticals."
	canonical="{page.url.origin}/for/{data.useCase.slug}"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${data.useCase.name} Fintech Tools`,
		description: data.useCase.description ?? `Tools for ${data.useCase.name}`,
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
			<span>Use Cases</span>
		</nav>
		<p class="text-xs font-semibold uppercase tracking-widest text-[--color-primary] mb-2">
			Use Case
		</p>
		<h1 class="text-2xl sm:text-4xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			{data.useCase.name}
		</h1>
		{#if data.useCase.description}
			<p class="mt-3 text-base text-[--color-text-muted] max-w-2xl leading-relaxed">
				{data.useCase.description}
			</p>
		{/if}
		<p class="mt-3 text-sm text-[--color-text-muted]">
			{data.totalTools} tool{data.totalTools === 1 ? '' : 's'} across all verticals
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
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-[--color-text-muted]">No tools matched this use case yet</p>
			<p class="mt-2 text-sm">
				<a href="/tools" class="text-[--color-primary] hover:underline">Browse all tools</a>
			</p>
		</div>
	{/if}
</div>
