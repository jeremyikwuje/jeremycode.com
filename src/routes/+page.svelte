<script lang="ts">
	import { page } from '$app/state';
	import ToolListItem from '$lib/components/tools/ToolListItem.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const activeVerticals = $derived(data.verticals.filter((v) => v.is_active));

	const jsonLd = $derived([
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: 'Jeremy Code — Stablecoin Tools Directory',
			url: page.url.origin,
			description:
				'A curated, searchable directory of stablecoin infrastructure tools for developers, product teams, and founders.',
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: `${page.url.origin}/tools?search={search_term_string}`
				},
				'query-input': 'required name=search_term_string'
			}
		}
	]);
</script>

<SeoHead
	title="The best new APIs in stablecoin"
	description="A curated, searchable directory of stablecoin infrastructure tools for developers, product teams, and founders. Compare APIs across stablecoins, payments, KYC, and more."
	canonical="{page.url.origin}/"
	{jsonLd}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
	<!-- Two-column layout -->
	<div class="flex gap-8 items-start">
		<!-- ═══ Main column ═══ -->
		<div class="flex-1 min-w-0">

				<!-- Welcome banner -->
			<div
				class="flex items-start gap-4 px-5 py-4 mb-8"
				style="background: var(--color-surface-1); border-radius: var(--radius-card);"
			>
				<span class="text-2xl shrink-0" aria-hidden="true">&#9889;</span>
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold" style="color: var(--color-text);">
						Welcome to Jeremy Code!
					</p>
					<p class="text-sm mt-0.5" style="color: var(--color-text-secondary);">
						The place to discover and find the best stablecoin and fintech infrastructure tools.
					</p>
				</div>
			</div>

			<!-- Section: New Tools This Week -->
			{#if data.newThisWeek.length > 0}
				<section>
					<h2
						class="text-base font-bold mb-4"
						style="color: var(--color-text); font-family: var(--font-display);"
					>
						New Tools This Week
					</h2>
					<div class="flex flex-col gap-2">
						{#each data.newThisWeek as tool, i (tool.id)}
							<ToolListItem {tool} rank={i + 1} />
						{/each}
					</div>
					<div class="mt-4">
						<Button href="/tools" variant="ghost" size="sm">
							View all tools &rarr;
						</Button>
					</div>
				</section>
			{/if}

			<!-- Section: Most Popular Tools -->
			{#if data.popularTools.length > 0}
				<section class="mt-10">
					<h2
						class="text-base font-bold mb-4"
						style="color: var(--color-text); font-family: var(--font-display);"
					>
						Most Popular Tools
					</h2>
					<div class="flex flex-col gap-2">
						{#each data.popularTools as tool, i (tool.id)}
							<ToolListItem {tool} rank={i + 1} />
						{/each}
					</div>
				</section>
			{/if}

			<!-- Section: Last Week's Tools -->
			{#if data.lastWeekTools.length > 0}
				<section class="mt-10">
					<h2
						class="text-base font-bold mb-4"
						style="color: var(--color-text); font-family: var(--font-display);"
					>
						Last Week's Tools
					</h2>
					<div class="flex flex-col gap-2">
						{#each data.lastWeekTools as tool, i (tool.id)}
							<ToolListItem {tool} rank={i + 1} />
						{/each}
					</div>
					<div class="mt-4">
						<Button href="/tools" variant="ghost" size="sm">
							Browse all {data.totalTools} tools &rarr;
						</Button>
					</div>
				</section>
			{/if}

			<!-- Section: Latest from Jeremy -->
			{#if data.learnContent.length > 0}
				<section class="mt-10">
					<div class="flex items-center justify-between mb-4">
						<h2
							class="text-base font-bold"
							style="color: var(--color-text); font-family: var(--font-display);"
						>
							Latest from Jeremy
						</h2>
						<Button href="/learn" variant="ghost" size="sm">View all</Button>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each data.learnContent as content (content.id)}
							<Card href={content.url} class="p-4">
								<div class="flex items-center gap-2 mb-2">
									{#if content.source === 'youtube'}
										<span class="text-xs font-medium" style="color: var(--color-accent-green);">YouTube</span>
									{:else}
										<span class="text-xs font-medium" style="color: var(--color-secondary);">Substack</span>
									{/if}
								</div>
								<h3 class="text-sm font-semibold line-clamp-2" style="color: var(--color-text);">
									{content.title}
								</h3>
								{#if content.description}
									<p class="mt-1 text-xs line-clamp-2" style="color: var(--color-text-secondary);">
										{content.description}
									</p>
								{/if}
							</Card>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<!-- ═══ Right sidebar ═══ -->
		<aside class="hidden lg:block w-72 shrink-0 sticky top-24">
			<!-- Explore Verticals -->
			{#if activeVerticals.length > 0}
				<div class="mb-8">
					<h3
						class="text-sm font-bold mb-3"
						style="color: var(--color-text); font-family: var(--font-display);"
					>
						Explore Verticals
					</h3>
					<div class="flex flex-col gap-1">
						{#each activeVerticals as vertical (vertical.id)}
							<a
								href="/{vertical.slug}"
								class="flex items-center justify-between px-3 py-2.5 text-sm transition-colors"
								style="border-radius: var(--radius-button); color: var(--color-text-secondary);"
								onmouseenter={(e) => {
									(e.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)';
									(e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
								}}
								onmouseleave={(e) => {
									(e.currentTarget as HTMLElement).style.background = '';
									(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
								}}
							>
								<span class="flex items-center gap-2">
									{#if vertical.icon}
										<span class="text-base">{vertical.icon}</span>
									{/if}
									{vertical.name}
								</span>
								{#if vertical.tool_count !== undefined}
									<span class="text-xs" style="color: var(--color-text-tertiary);">
										{vertical.tool_count}
									</span>
								{/if}
							</a>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Popular Tools (compact list) -->
			{#if data.popularTools.length > 0}
				<div
					class="p-4"
					style="background: var(--color-surface-1); border-radius: var(--radius-card);"
				>
					<h3
						class="text-sm font-bold mb-3"
						style="color: var(--color-text); font-family: var(--font-display);"
					>
						Trending Tools
					</h3>
					<ol class="flex flex-col gap-2.5">
						{#each data.popularTools.slice(0, 5) as tool, i (tool.id)}
							<li>
								<a
									href="/tools/{tool.slug}"
									class="flex items-start gap-2.5 group"
								>
									<span
										class="shrink-0 text-xs font-medium mt-0.5 w-4 text-right tabular-nums"
										style="color: var(--color-text-tertiary);"
									>
										{i + 1}.
									</span>
									<div class="min-w-0">
										<p
											class="text-sm font-medium truncate group-hover:underline"
											style="color: var(--color-text);"
										>
											{tool.name}
										</p>
										<p class="text-xs truncate" style="color: var(--color-text-tertiary);">
											{tool.tagline}
										</p>
									</div>
								</a>
							</li>
						{/each}
					</ol>
				</div>
			{/if}

			<!-- Quick links -->
			<div class="mt-6 flex flex-col gap-2">
				<Button href="https://jeremycode.substack.com" variant="ghost" size="sm" class="w-full">
					Subscribe to newsletter
				</Button>
				<Button href="/submit" variant="ghost" size="sm" class="w-full">
					Recommend a tool
				</Button>
			</div>
		</aside>
	</div>
</div>
