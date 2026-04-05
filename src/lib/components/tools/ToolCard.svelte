<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { Tool } from '$lib/types/index.js';

	interface Props {
		tool: Tool;
		variant?: 'grid' | 'list';
		class?: string;
	}

	let { tool, variant = 'grid', class: extraClass = '' }: Props = $props();

	const accentColor = $derived(tool.vertical?.accent_colour ?? 'var(--color-primary)');

	function toolInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}
</script>

{#if variant === 'grid'}
	<Card href="/tools/{tool.slug}" class="group flex flex-col p-4 gap-3 {extraClass}">
		<!-- Top row: logo + name + badges -->
		<div class="flex items-start gap-3">
			{#if tool.logo_url}
				<img
					src={tool.logo_url}
					alt="{tool.name} logo"
					width="40"
					height="40"
					loading="lazy"
					class="shrink-0 object-contain"
					style="border-radius: var(--radius-badge);"
				/>
			{:else}
				<span
					class="shrink-0 w-10 h-10 flex items-center justify-center
					       bg-[--color-surface-alt] text-[--color-text-muted] text-base font-bold"
					style="border-radius: var(--radius-badge);"
					aria-hidden="true"
				>
					{toolInitial(tool.name)}
				</span>
			{/if}

			<div class="flex-1 min-w-0">
				<h3
					class="text-sm font-semibold text-[--color-text] truncate
					       group-hover:text-[--color-primary] transition-colors"
					style="font-family: var(--font-display);"
				>
					{tool.name}
				</h3>
				<p class="text-xs text-[--color-text-muted] truncate mt-0.5">
					{tool.tagline}
				</p>
			</div>
		</div>

		<!-- Badges -->
		<div class="flex flex-wrap items-center gap-1.5">
			<span
				class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
				style="
				  border-radius: var(--radius-badge);
				  background-color: color-mix(in srgb, {accentColor} 20%, transparent);
				  color: {accentColor};
				"
			>
				{tool.vertical.name}
			</span>

			<Badge variant="category">{tool.category.name}</Badge>

			{#if tool.has_public_api}
				<Badge variant="api">{tool.api_type ?? 'API'}</Badge>
			{/if}
		</div>

		<!-- Footer: pricing + regions count -->
		<div class="flex items-center justify-between mt-auto pt-1 text-xs text-[--color-text-muted]">
			<span class="capitalize">{tool.pricing_model.replace('_', '-')}</span>
			{#if tool.regions.length > 0}
				<span>{tool.regions.length} region{tool.regions.length === 1 ? '' : 's'}</span>
			{/if}
		</div>
	</Card>
{:else}
	<!-- List variant — horizontal, compact (mobile + search results) -->
	<a
		href="/tools/{tool.slug}"
		class="group flex items-center gap-4 px-4 py-3
		       border-b border-[--color-border] last:border-b-0
		       hover:bg-[--color-surface] transition-colors {extraClass}"
	>
		<!-- Logo -->
		{#if tool.logo_url}
			<img
				src={tool.logo_url}
				alt="{tool.name} logo"
				width="32"
				height="32"
				loading="lazy"
				class="shrink-0 object-contain"
				style="border-radius: var(--radius-badge);"
			/>
		{:else}
			<span
				class="shrink-0 w-8 h-8 flex items-center justify-center
				       bg-[--color-surface-alt] text-[--color-text-muted] text-sm font-bold"
				style="border-radius: var(--radius-badge);"
				aria-hidden="true"
			>
				{toolInitial(tool.name)}
			</span>
		{/if}

		<!-- Name + tagline -->
		<div class="flex-1 min-w-0">
			<p
				class="text-sm font-semibold text-[--color-text] truncate
				       group-hover:text-[--color-primary] transition-colors"
				style="font-family: var(--font-display);"
			>
				{tool.name}
			</p>
			<p class="text-xs text-[--color-text-muted] truncate">{tool.tagline}</p>
		</div>

		<!-- Badges — hidden on narrow screens -->
		<div class="hidden sm:flex items-center gap-1.5 shrink-0">
			<span
				class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
				style="
				  border-radius: var(--radius-badge);
				  background-color: color-mix(in srgb, {accentColor} 20%, transparent);
				  color: {accentColor};
				"
			>
				{tool.vertical.name}
			</span>
			<Badge variant="category">{tool.category.name}</Badge>
		</div>

		<!-- Pricing -->
		<span class="hidden lg:block shrink-0 text-xs text-[--color-text-muted] capitalize">
			{tool.pricing_model.replace('_', '-')}
		</span>
	</a>
{/if}
