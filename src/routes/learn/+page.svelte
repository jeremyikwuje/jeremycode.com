<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const activeVerticals = $derived(data.verticals.filter((v) => v.is_active));

	function filterByVertical(slug: string | null) {
		if (slug) {
			goto(`/learn?vertical=${slug}`, { replaceState: true });
		} else {
			goto('/learn', { replaceState: true });
		}
	}
</script>

<SeoHead
	title="Learn — Fintech Engineering"
	description="Articles and videos from Jeremy on fintech infrastructure, stablecoins, payments, KYC, and more. Engineer-focused content for developers building on fintech APIs."
	canonical="{page.url.origin}/learn"
/>

<section class="border-b border-[--color-border]">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
		<h1 class="text-2xl sm:text-4xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			Learn
		</h1>
		<p class="mt-3 text-base text-[--color-text-muted] max-w-2xl leading-relaxed">
			Articles and videos on fintech engineering — stablecoins, payments, KYC, and the APIs that power them.
		</p>

		<!-- Vertical filter tabs -->
		{#if activeVerticals.length > 0}
			<nav class="flex flex-wrap gap-2 mt-6" aria-label="Filter by vertical">
				<button
					type="button"
					onclick={() => filterByVertical(null)}
					class="h-8 px-3 text-sm font-medium transition-colors
					       {data.activeVerticalSlug === null
						? 'bg-[--color-primary] text-white'
						: 'bg-[--color-surface] text-[--color-text-muted] border border-[--color-border] hover:text-[--color-text]'}"
					style="border-radius: var(--radius-button);"
				>
					All
				</button>
				{#each activeVerticals as v (v.id)}
					{@const active = data.activeVerticalSlug === v.slug}
					{@const color = v.accent_colour ?? 'var(--color-primary)'}
					<button
						type="button"
						onclick={() => filterByVertical(v.slug)}
						class="h-8 px-3 text-sm font-medium transition-colors"
						style="border-radius: var(--radius-button);
						       {active
							? `background-color: color-mix(in srgb, ${color} 25%, transparent); color: ${color};`
							: 'background-color: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-muted);'}"
					>
						{v.name}
					</button>
				{/each}
			</nav>
		{/if}
	</div>
</section>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
	{#if data.learn.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{#each data.learn as content (content.id)}
				<Card href={content.url} class="p-4 flex flex-col gap-3">
					<!-- Source badge -->
					<div class="flex items-center gap-1.5">
						{#if content.source === 'youtube'}
							<span class="text-xs font-semibold text-[--color-accent-green]">YouTube</span>
						{:else}
							<span class="text-xs font-semibold text-[--color-secondary]">Substack</span>
						{/if}
					</div>

					<h2 class="text-sm font-semibold text-[--color-text] line-clamp-3 flex-1">
						{content.title}
					</h2>

					{#if content.description}
						<p class="text-xs text-[--color-text-muted] line-clamp-2">
							{content.description}
						</p>
					{/if}

					<!-- Associated verticals -->
					{#if content.associated_verticals.length > 0}
						<div class="flex flex-wrap gap-1 mt-auto pt-1">
							{#each content.associated_verticals as v}
								<span class="text-xs text-[--color-text-muted]">{v.name}</span>
							{/each}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{:else}
		<div class="py-16 text-center">
			<p class="text-lg text-[--color-text-muted]">No content yet</p>
			{#if data.activeVerticalSlug}
				<Button variant="ghost" onclick={() => filterByVertical(null)} class="mt-4">
					View all content
				</Button>
			{/if}
		</div>
	{/if}
</div>
