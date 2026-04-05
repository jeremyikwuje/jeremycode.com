<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Tool } from '$lib/types/index.js';

	interface Props {
		tool: Tool;
		rank?: number;
		class?: string;
	}

	let { tool, rank, class: extraClass = '' }: Props = $props();

	const accentColor = $derived(tool.vertical?.accent_colour ?? 'var(--color-primary)');

	function toolInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	const pricingLabel = $derived(
		tool.pricing_model ? tool.pricing_model.replace(/_/g, '-') : null
	);

	const difficultyColors: Record<string, string> = {
		beginner: 'var(--color-accent-green)',
		intermediate: 'var(--color-secondary)',
		advanced: '#F59E0B'
	};
</script>

<a
	href="/tools/{tool.slug}"
	class="group flex items-center gap-4 px-4 py-4 sm:px-5
	       bg-[--color-surface] border border-[--color-border]
	       hover:border-[--color-primary] hover:shadow-[0_0_0_1px_var(--color-primary)]
	       transition-[border-color,box-shadow] {extraClass}"
	style="border-radius: var(--radius-card);"
>
	<!-- Rank number (optional) -->
	{#if rank !== undefined}
		<span
			class="hidden sm:flex shrink-0 w-6 text-sm font-semibold text-[--color-text-muted] tabular-nums text-right"
		>
			{rank}.
		</span>
	{/if}

	<!-- Logo -->
	{#if tool.logo_url}
		<img
			src={tool.logo_url}
			alt="{tool.name} logo"
			width="48"
			height="48"
			loading="lazy"
			class="shrink-0 w-12 h-12 object-contain"
			style="border-radius: var(--radius-card);"
		/>
	{:else}
		<span
			class="shrink-0 w-12 h-12 flex items-center justify-center
			       bg-[--color-surface-alt] text-[--color-text-muted] text-lg font-bold"
			style="border-radius: var(--radius-card);"
			aria-hidden="true"
		>
			{toolInitial(tool.name)}
		</span>
	{/if}

	<!-- Name + tagline + inline badges -->
	<div class="flex-1 min-w-0">
		<div class="flex items-center gap-2 flex-wrap">
			<h3
				class="text-base font-semibold text-[--color-text]
				       group-hover:text-[--color-primary] transition-colors"
				style="font-family: var(--font-display);"
			>
				{tool.name}
			</h3>

			<!-- Separator dot -->
			<span class="hidden sm:block w-1 h-1 bg-[--color-border] shrink-0" style="border-radius: 50%;"></span>

			<p class="hidden sm:block text-sm text-[--color-text-muted] truncate">
				{tool.tagline}
			</p>
		</div>

		<!-- Mobile tagline -->
		<p class="sm:hidden text-sm text-[--color-text-muted] truncate mt-0.5">
			{tool.tagline}
		</p>

		<!-- Badges row -->
		<div class="flex flex-wrap items-center gap-1.5 mt-2">
			{#if tool.vertical}
				<span
					class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
					style="
					  border-radius: var(--radius-badge);
					  background-color: color-mix(in srgb, {accentColor} 15%, transparent);
					  color: {accentColor};
					"
				>
					{tool.vertical.name}
				</span>
			{/if}

			{#if tool.category}
				<Badge variant="category">{tool.category.name}</Badge>
			{/if}

			{#if tool.has_public_api}
				<Badge variant="api">{tool.api_type ?? 'API'}</Badge>
			{/if}

			{#if pricingLabel}
				<span
					class="inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize
					       bg-[--color-surface-alt] text-[--color-text-muted]"
					style="border-radius: var(--radius-badge);"
				>
					{pricingLabel}
				</span>
			{/if}

			{#if tool.difficulty_rating}
				{@const color = difficultyColors[tool.difficulty_rating] ?? 'var(--color-text-muted)'}
				<span
					class="hidden md:inline-flex items-center px-2 py-0.5 text-xs font-medium capitalize"
					style="
					  border-radius: var(--radius-badge);
					  background-color: color-mix(in srgb, {color} 15%, transparent);
					  color: {color};
					"
				>
					{tool.difficulty_rating}
				</span>
			{/if}
		</div>
	</div>

	<!-- Right side: chevron indicator -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="shrink-0 text-[--color-text-muted] opacity-0 group-hover:opacity-100
		       transition-opacity hidden sm:block"
		aria-hidden="true"
	>
		<polyline points="9 18 15 12 9 6" />
	</svg>
</a>
