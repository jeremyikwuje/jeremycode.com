<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolHeader from '$lib/components/tools/ToolHeader.svelte';
	import ExpertTakeCard from '$lib/components/tools/ExpertTakeCard.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const tool = $derived(data.tool);
	const accentColor = $derived(tool.vertical?.accent_colour ?? 'var(--color-primary)');

	const verticalName = $derived(tool.vertical?.name ?? 'Fintech');
	const categoryName = $derived(tool.category?.name ?? '');

	const seoDesc = $derived(
		[
			tool.tagline,
			`${verticalName} ${categoryName} tool${tool.has_public_api ? ` with ${tool.api_type ?? 'API'} access` : ''}.`,
			tool.regions?.length > 0 ? `Available in ${tool.regions.map((r) => r.name).join(', ')}.` : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: tool.name,
		description: tool.tagline,
		url: tool.website_url,
		applicationCategory: `${verticalName} — ${categoryName}`,
		...(tool.logo_url ? { image: tool.logo_url } : {}),
		offers: {
			'@type': 'Offer',
			price: '0',
			priceCurrency: 'USD',
			description: tool.pricing_model.replace('_', '-')
		},
		...(tool.has_public_api
			? {
					featureList: [
						`API Type: ${tool.api_type ?? 'API'}`,
						...(tool.has_sandbox ? ['Sandbox available'] : []),
						...(tool.sdk_languages ?? []).map((l) => `SDK: ${l}`)
					]
				}
			: {}),
		...((tool.regions?.length ?? 0) > 0
			? { areaServed: tool.regions.map((r) => ({ '@type': 'Place', name: r.name })) }
			: {})
	});
</script>

<SeoHead
	title="{tool.name} — {verticalName} {categoryName} Tool"
	description={seoDesc}
	canonical="{page.url.origin}/tools/{tool.slug}"
	image={tool.logo_url ?? undefined}
	{jsonLd}
/>

<article>
	<!-- Hero header with vertical accent -->
	<ToolHeader {tool} />

	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="flex flex-col lg:flex-row gap-8 lg:gap-12">
			<!-- Main content -->
			<div class="flex-1 min-w-0">
				<!-- Description -->
				<section>
					<h2
						class="text-lg font-semibold text-[--color-text] mb-3"
						style="font-family: var(--font-display);"
					>
						About {tool.name}
					</h2>
					<div class="prose-sm text-[--color-text] leading-relaxed whitespace-pre-line">
						{tool.description}
					</div>
				</section>

				<!-- Expert takes -->
				{#if (tool.expert_takes?.length ?? 0) > 0}
					<section class="mt-10">
						<h2
							class="text-lg font-semibold text-[--color-text] mb-4"
							style="font-family: var(--font-display);"
						>
							Expert Takes
							<span class="text-sm font-normal text-[--color-text-muted] ml-1">
								({tool.expert_takes?.length ?? 0})
							</span>
						</h2>
						<div class="flex flex-col gap-4">
							{#each tool.expert_takes ?? [] as take (take.id)}
								<ExpertTakeCard {take} />
							{/each}
						</div>
					</section>
				{/if}

				<!-- API section -->
				{#if tool.has_public_api}
					<section class="mt-10">
						<h2
							class="text-lg font-semibold text-[--color-text] mb-3"
							style="font-family: var(--font-display);"
						>
							API & Integration
						</h2>
						<dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{#if tool.api_type}
								<div>
									<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
										API Type
									</dt>
									<dd class="mt-1">
										<Badge variant="api">{tool.api_type}</Badge>
									</dd>
								</div>
							{/if}
							<div>
								<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
									Sandbox
								</dt>
								<dd class="mt-1 text-sm text-[--color-text]">
									{tool.has_sandbox ? 'Available' : 'Not available'}
								</dd>
							</div>
							{#if tool.sdk_languages?.length > 0}
								<div class="sm:col-span-2">
									<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
										SDK Languages
									</dt>
									<dd class="mt-1 flex flex-wrap gap-1.5">
										{#each tool.sdk_languages as lang}
											<Badge>{lang}</Badge>
										{/each}
									</dd>
								</div>
							{/if}
						</dl>
					</section>
				{/if}
			</div>

			<!-- Sidebar -->
			<aside class="lg:w-72 shrink-0">
				<div
					class="lg:sticky lg:top-24 flex flex-col gap-6 p-5"
					style="background: var(--color-surface-1); border-radius: var(--radius-card);"
				>
					<!-- Metadata table -->
					<dl class="flex flex-col gap-3">
						<div>
							<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
								Vertical
							</dt>
							<dd class="mt-1">
								<a
									href="/{tool.vertical?.slug ?? ''}"
									class="text-sm font-medium hover:underline"
									style="color: {accentColor};"
								>
									{verticalName}
								</a>
							</dd>
						</div>
						<div>
							<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
								Category
							</dt>
							<dd class="mt-1">
								<a
									href="/{tool.vertical?.slug ?? ''}/{tool.category?.slug ?? ''}"
									class="text-sm font-medium text-[--color-secondary] hover:underline"
								>
									{categoryName}
								</a>
							</dd>
						</div>
						<div>
							<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
								Pricing
							</dt>
							<dd class="mt-1 text-sm text-[--color-text] capitalize">
								{(tool.pricing_model ?? '').replace('_', '-')}
							</dd>
						</div>
						{#if tool.difficulty_rating}
							<div>
								<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
									Difficulty
								</dt>
								<dd class="mt-1 text-sm text-[--color-text] capitalize">
									{tool.difficulty_rating}
								</dd>
							</div>
						{/if}
						{#if (tool.regions?.length ?? 0) > 0}
							<div>
								<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
									Regions
								</dt>
								<dd class="mt-1 flex flex-wrap gap-1">
									{#each tool.regions as region}
										<Badge variant="region">{region.name}</Badge>
									{/each}
								</dd>
							</div>
						{/if}

						<!-- Dynamic vertical-specific attributes in sidebar -->
						{#each Object.entries(tool.attributes ?? {}) as [key, value]}
							{@const def = tool.vertical?.attribute_definitions?.find((d) => d.key === key)}
							{@const label = def?.display_name ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							<div>
								<dt class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
									{label}
								</dt>
								<dd class="mt-1">
									{#if Array.isArray(value)}
										<div class="flex flex-wrap gap-1">
											{#each value as v}
												<Badge>{v}</Badge>
											{/each}
										</div>
									{:else if typeof value === 'boolean'}
										<span class="text-sm text-[--color-text]">{value ? 'Yes' : 'No'}</span>
									{:else}
										<span class="text-sm text-[--color-text]">{value}</span>
									{/if}
								</dd>
							</div>
						{/each}
					</dl>

					<!-- Links -->
					<div class="flex flex-col gap-2 pt-4" style="border-top: 1px solid var(--color-border-subtle);">
						<Button href={tool.website_url} size="sm">
							Visit Website
						</Button>
						{#if tool.docs_url}
							<Button href={tool.docs_url} variant="ghost" size="sm">
								Documentation
							</Button>
						{/if}
						{#if tool.github_url}
							<Button href={tool.github_url} variant="ghost" size="sm">
								GitHub
							</Button>
						{/if}
					</div>

					<!-- Compare CTA -->
					<div class="pt-4" style="border-top: 1px solid var(--color-border-subtle);">
						<p class="text-xs text-[--color-text-muted] mb-2">Compare with another tool</p>
						<Button href="/tools" variant="ghost" size="sm" class="w-full">
							Browse tools to compare
						</Button>
					</div>
				</div>
			</aside>
		</div>
	</div>
</article>
