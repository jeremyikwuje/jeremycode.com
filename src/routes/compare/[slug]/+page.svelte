<script lang="ts">
	import { page } from '$app/state';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Tool, AttributeDefinition } from '$lib/types/index.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const { toolA, toolB, comparison, sameVertical } = $derived(data);

	// Universal fields always compared
	interface CompareRow {
		label: string;
		a: string | boolean | null;
		b: string | boolean | null;
		key?: string;
	}

	const universalRows = $derived<CompareRow[]>([
		{ label: 'Vertical', a: toolA.vertical.name, b: toolB.vertical.name },
		{ label: 'Category', a: toolA.category.name, b: toolB.category.name },
		{ label: 'Pricing', a: toolA.pricing_model.replace('_', '-'), b: toolB.pricing_model.replace('_', '-') },
		{ label: 'Public API', a: toolA.has_public_api, b: toolB.has_public_api },
		{ label: 'API Type', a: toolA.api_type, b: toolB.api_type },
		{ label: 'Sandbox', a: toolA.has_sandbox, b: toolB.has_sandbox },
		{ label: 'Open Source', a: toolA.open_source, b: toolB.open_source },
		{ label: 'Difficulty', a: toolA.difficulty_rating, b: toolB.difficulty_rating }
	]);

	// Vertical-specific attribute rows — only when both tools share a vertical
	const attrRows = $derived(
		sameVertical
			? toolA.vertical.attribute_definitions.map((def) => ({
					def,
					a: toolA.attributes[def.key] ?? null,
					b: toolB.attributes[def.key] ?? null
				}))
			: []
	);

	function displayValue(value: unknown): string {
		if (value === null || value === undefined) return '—';
		if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—';
		if (typeof value === 'boolean') return value ? 'Yes' : 'No';
		return String(value);
	}

	function winner(key: string): 'a' | 'b' | 'tie' | null {
		return comparison?.highlights?.[key] ?? null;
	}

	function toolInitial(name: string) {
		return name.charAt(0).toUpperCase();
	}
</script>

<SeoHead
	title="{toolA.name} vs {toolB.name}"
	description="Side-by-side comparison of {toolA.name} and {toolB.name}. Compare API types, pricing, regions, SDK support, and {sameVertical ? `${toolA.vertical.name}-specific` : 'feature'} attributes."
	canonical="{page.url.origin}/compare/{toolA.slug}-vs-{toolB.slug}"
/>

<div class="max-w-5xl mx-auto px-4 sm:px-6 py-10">
	<!-- Header -->
	<div class="mb-8">
		<nav class="text-sm text-[--color-text-muted] mb-3" aria-label="Breadcrumb">
			<a href="/tools" class="hover:text-[--color-text] transition-colors">Tools</a>
			<span class="mx-1.5" aria-hidden="true">/</span>
			<span>Compare</span>
		</nav>
		<h1 class="text-2xl sm:text-3xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			{toolA.name} vs {toolB.name}
		</h1>
		{#if !sameVertical}
			<p class="mt-2 text-sm text-[--color-text-muted]">
				Cross-vertical comparison — only universal attributes are shown.
			</p>
		{/if}
	</div>

	<!-- Tool hero cards -->
	<div class="grid grid-cols-2 gap-4 mb-8">
		{#each [toolA, toolB] as tool (tool.id)}
			{@const accent = tool.vertical.accent_colour ?? 'var(--color-primary)'}
			<div
				class="p-5 flex flex-col gap-3"
				style="background: var(--color-surface-1); border-radius: var(--radius-card);"
			>
				<div class="flex items-center gap-3">
					{#if tool.logo_url}
						<img src={tool.logo_url} alt="{tool.name} logo" width="40" height="40"
							class="shrink-0 object-contain" style="border-radius: var(--radius-badge);" />
					{:else}
						<span class="shrink-0 w-10 h-10 flex items-center justify-center
							bg-[--color-surface-2] text-[--color-text-muted] text-base font-bold"
							style="border-radius: var(--radius-badge);" aria-hidden="true">
							{toolInitial(tool.name)}
						</span>
					{/if}
					<div class="min-w-0">
						<h2 class="text-sm font-semibold text-[--color-text] truncate"
							style="font-family: var(--font-display);">{tool.name}</h2>
						<p class="text-xs text-[--color-text-muted] truncate">{tool.tagline}</p>
					</div>
				</div>
				<div class="flex flex-wrap gap-1.5">
					<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
						style="border-radius: var(--radius-badge); background-color: color-mix(in srgb, {accent} 20%, transparent); color: {accent};">
						{tool.vertical.name}
					</span>
					<Badge variant="category">{tool.category.name}</Badge>
				</div>
				<Button href="/tools/{tool.slug}" variant="ghost" size="sm">View profile</Button>
			</div>
		{/each}
	</div>

	<!-- Comparison table -->
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="py-3 pr-4 text-left text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider w-1/3">
						Attribute
					</th>
					<th class="py-3 px-4 text-left text-xs font-semibold text-[--color-text] uppercase tracking-wider w-1/3">
						{toolA.name}
					</th>
					<th class="py-3 pl-4 text-left text-xs font-semibold text-[--color-text] uppercase tracking-wider w-1/3">
						{toolB.name}
					</th>
				</tr>
			</thead>

			<tbody>
				<!-- Universal rows -->
				{#each universalRows as row}
					{@const w = winner(row.label.toLowerCase().replace(' ', '_'))}
					<tr class="border-b border-[--color-border] last:border-0">
						<td class="py-3 pr-4 text-xs text-[--color-text-muted] font-medium">{row.label}</td>
						<td class="py-3 px-4 {w === 'a' ? 'text-[--color-primary] font-medium' : 'text-[--color-text]'}">
							{displayValue(row.a)}
						</td>
						<td class="py-3 pl-4 {w === 'b' ? 'text-[--color-primary] font-medium' : 'text-[--color-text]'}">
							{displayValue(row.b)}
						</td>
					</tr>
				{/each}

				<!-- SDK Languages -->
				<tr class="border-b border-[--color-border]">
					<td class="py-3 pr-4 text-xs text-[--color-text-muted] font-medium">SDK Languages</td>
					<td class="py-3 px-4">
						{#if toolA.sdk_languages.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each toolA.sdk_languages as lang}
									<Badge>{lang}</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-[--color-text-muted]">—</span>
						{/if}
					</td>
					<td class="py-3 pl-4">
						{#if toolB.sdk_languages.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each toolB.sdk_languages as lang}
									<Badge>{lang}</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-[--color-text-muted]">—</span>
						{/if}
					</td>
				</tr>

				<!-- Regions -->
				<tr class="border-b border-[--color-border]">
					<td class="py-3 pr-4 text-xs text-[--color-text-muted] font-medium">Regions</td>
					<td class="py-3 px-4">
						{#if toolA.regions.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each toolA.regions as r}
									<Badge variant="region">{r.name}</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-[--color-text-muted]">—</span>
						{/if}
					</td>
					<td class="py-3 pl-4">
						{#if toolB.regions.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each toolB.regions as r}
									<Badge variant="region">{r.name}</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-[--color-text-muted]">—</span>
						{/if}
					</td>
				</tr>

				<!-- Vertical-specific attribute rows -->
				{#each attrRows as { def, a, b }}
					{@const w = winner(def.key)}
					<tr class="border-b border-[--color-border] last:border-0">
						<td class="py-3 pr-4 text-xs text-[--color-text-muted] font-medium">{def.display_name}</td>
						<td class="py-3 px-4 {w === 'a' ? 'text-[--color-primary] font-medium' : 'text-[--color-text]'}">
							{displayValue(a)}
						</td>
						<td class="py-3 pl-4 {w === 'b' ? 'text-[--color-primary] font-medium' : 'text-[--color-text]'}">
							{displayValue(b)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Expert takes comparison -->
	{#if toolA.expert_takes.length > 0 || toolB.expert_takes.length > 0}
		<section class="mt-12">
			<h2 class="text-lg font-semibold text-[--color-text] mb-6" style="font-family: var(--font-display);">
				Expert Takes
			</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{#each [{ tool: toolA, takes: toolA.expert_takes }, { tool: toolB, takes: toolB.expert_takes }] as side}
					<div>
						<h3 class="text-sm font-semibold text-[--color-text-muted] mb-3">{side.tool.name}</h3>
						{#if side.takes.length > 0}
							{#each side.takes as take (take.id)}
								<div class="p-4 text-sm text-[--color-text] leading-relaxed"
									style="background: var(--color-surface-1); border-radius: var(--radius-card);">
									<p class="font-medium text-xs text-[--color-text-muted] mb-2">{take.expert.name}</p>
									{take.content}
								</div>
							{/each}
						{:else}
							<p class="text-sm text-[--color-text-muted] italic">No expert takes yet</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Browse more -->
	<div class="mt-12 flex flex-wrap gap-3">
		<Button href="/tools" variant="ghost">Browse all tools</Button>
		<Button href="/tools/{toolA.slug}" variant="ghost">{toolA.name} profile</Button>
		<Button href="/tools/{toolB.slug}" variant="ghost">{toolB.name} profile</Button>
	</div>
</div>
