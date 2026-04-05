<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const vertical = $derived(data.vertical);
	const category = $derived(data.category);
	const accentColor = $derived(vertical.accent_colour ?? 'var(--color-primary)');
</script>

<SeoHead
	title="{category.name} — {vertical.name} Tools for Developers"
	description="{category.description ?? `Browse ${category.name} tools in the ${vertical.name} vertical.`} {data.totalTools} tool{data.totalTools === 1 ? '' : 's'} available."
	canonical="{page.url.origin}/{vertical.slug}/{category.slug}"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${category.name} — ${vertical.name} Tools`,
		description: category.description ?? `${category.name} tools in the ${vertical.name} vertical`,
		numberOfItems: data.totalTools,
		itemListElement: data.tools.map((tool, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			url: `${page.url.origin}/tools/${tool.slug}`,
			name: tool.name
		}))
	}}
/>

<!-- Category header -->
<section
	class="border-b border-[--color-border]"
	style="--vertical-color: {accentColor};"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
		<!-- Breadcrumb -->
		<nav class="flex items-center gap-1.5 text-sm text-[--color-text-muted] mb-4" aria-label="Breadcrumb">
			<a href="/{vertical.slug}" class="hover:text-[--color-text] transition-colors" style="color: {accentColor};">
				{vertical.name}
			</a>
			<span aria-hidden="true">/</span>
			<span class="text-[--color-text]">{category.name}</span>
		</nav>

		<h1
			class="text-2xl sm:text-3xl font-bold text-[--color-text]"
			style="font-family: var(--font-display);"
		>
			{category.name}
		</h1>
		{#if category.description}
			<p class="mt-2 text-base text-[--color-text-muted] max-w-2xl leading-relaxed">
				{category.description}
			</p>
		{/if}
		<p class="mt-2 text-sm text-[--color-text-muted]">
			{data.totalTools} tool{data.totalTools === 1 ? '' : 's'}
		</p>

		<!-- Accent bar -->
		<div
			class="mt-5 h-1 w-16"
			style="background-color: {accentColor}; border-radius: 2px;"
		></div>
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
				<Button
					href="/tools?vertical={vertical.slug}&category={category.slug}"
					variant="ghost"
					size="md"
				>
					View all {data.totalTools} tools
				</Button>
			</div>
		{/if}
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-[--color-text-muted]">No tools in this category yet</p>
			<p class="mt-2 text-sm text-[--color-text-muted]">
				<a href="/{vertical.slug}" class="hover:underline" style="color: {accentColor};">
					Back to {vertical.name}
				</a>
				&middot;
				<a href="/submit" class="text-[--color-primary] hover:underline">Submit a tool</a>
			</p>
		</div>
	{/if}
</div>
