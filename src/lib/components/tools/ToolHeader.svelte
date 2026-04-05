<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TagBadge from './TagBadge.svelte';
	import type { Tool } from '$lib/types/index.js';

	interface Props {
		tool: Tool;
	}

	let { tool }: Props = $props();

	const accentColor = $derived(tool.vertical?.accent_colour ?? 'var(--color-primary)');

	function toolInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}
</script>

<!-- Vertical accent colour scoped to this component's subtree -->
<section
	class="border-b border-[--color-border]"
	style="--vertical-color: {accentColor};"
>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
		<div class="flex flex-col sm:flex-row items-start gap-6">
			<!-- Logo -->
			{#if tool.logo_url}
				<img
					src={tool.logo_url}
					alt="{tool.name} logo"
					width="72"
					height="72"
					class="shrink-0 object-contain"
					style="border-radius: var(--radius-card);"
				/>
			{:else}
				<span
					class="shrink-0 w-[72px] h-[72px] flex items-center justify-center
					       bg-[--color-surface-alt] text-[--color-text-muted] text-2xl font-bold"
					style="border-radius: var(--radius-card);"
					aria-hidden="true"
				>
					{toolInitial(tool.name)}
				</span>
			{/if}

			<!-- Content -->
			<div class="flex-1 min-w-0">
				<!-- Name -->
				<h1
					class="text-2xl sm:text-4xl font-bold text-[--color-text]"
					style="font-family: var(--font-display);"
				>
					{tool.name}
				</h1>

				<!-- Tagline -->
				<p class="mt-2 text-base sm:text-lg text-[--color-text-muted] max-w-2xl">
					{tool.tagline}
				</p>

				<!-- Badges -->
				<div class="flex flex-wrap items-center gap-2 mt-4">
					{#if tool.vertical?.name}
						<span
							class="inline-flex items-center px-2.5 py-1 text-xs font-medium"
							style="
							  border-radius: var(--radius-badge);
							  background-color: color-mix(in srgb, {accentColor} 20%, transparent);
							  color: {accentColor};
							"
						>
							{tool.vertical.name}
						</span>
					{/if}

					{#if tool.category?.name}
						<Badge variant="category">{tool.category.name}</Badge>
					{/if}

					{#if tool.has_public_api}
						<Badge variant="api">{tool.api_type ?? 'API'}</Badge>
					{/if}

					{#if tool.open_source}
						<Badge>Open Source</Badge>
					{/if}

					{#if tool.pricing_model}
						<span class="text-xs text-[--color-text-muted] capitalize">
							{tool.pricing_model.replace('_', '-')}
						</span>
					{/if}
				</div>

				<!-- SDK languages + regions -->
				{#if (tool.sdk_languages?.length ?? 0) > 0 || (tool.regions?.length ?? 0) > 0}
					<div class="flex flex-wrap items-center gap-1.5 mt-3">
						{#each tool.sdk_languages ?? [] as lang}
							<TagBadge label={lang} />
						{/each}
						{#each tool.regions ?? [] as region}
							<TagBadge label={region.name} colour="var(--color-accent-green)" />
						{/each}
					</div>
				{/if}

				<!-- CTA buttons -->
				<div class="flex flex-wrap items-center gap-3 mt-6">
					<Button href={tool.website_url} size="md">
						Visit Website
					</Button>
					{#if tool.docs_url}
						<Button href={tool.docs_url} variant="ghost" size="md">
							Documentation
						</Button>
					{/if}
					{#if tool.github_url}
						<Button href={tool.github_url} variant="ghost" size="md">
							GitHub
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Dynamic vertical-specific attributes — rendered inline below the hero -->
		{#if Object.keys(tool.attributes ?? {}).length > 0}
			<dl
				class="mt-8 pt-6 border-t border-[--color-border]
				       grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4"
			>
				{#each Object.entries(tool.attributes) as [key, value]}
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
										<TagBadge label={v} colour={accentColor} />
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
		{/if}
	</div>
</section>
