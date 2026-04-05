<script lang="ts">
	/**
	 * FilterPanel — the sidebar (desktop) / drawer (mobile) for the tool
	 * directory.
	 *
	 * Architecture:
	 *   Universal filters (region, API type, pricing) always appear.
	 *   Vertical-specific attribute filters appear ONLY when a vertical
	 *   is selected, and are generated dynamically from that vertical's
	 *   attribute definitions. The panel never hardcodes attribute keys.
	 *
	 * Data flow:
	 *   filterStore.attributeDefinitions  → drives which DynamicAttributeFilter
	 *                                        controls are rendered
	 *   filterStore.state                  → current values
	 *   filterStore.setAttribute / set*    → write new values
	 *   Parent page syncs filterStore ↔ URL.
	 */
	import { filterStore, uiStore } from '$lib/stores/index.js';
	import DynamicAttributeFilter from './DynamicAttributeFilter.svelte';
	import type { Vertical, Region, PricingModel } from '$lib/types/index.js';

	interface Props {
		verticals: Vertical[];
		regions: Region[];
		class?: string;
	}

	let { verticals, regions, class: extraClass = '' }: Props = $props();

	const activeVerticals = $derived(verticals.filter((v) => v.is_active));
	const filterableDefs = $derived(
		filterStore.attributeDefinitions
			.filter((d) => d.filterable)
			.sort((a, b) => a.display_order - b.display_order)
	);

	// Static data for universal filters
	const pricingOptions: { value: PricingModel; label: string }[] = [
		{ value: 'free', label: 'Free' },
		{ value: 'freemium', label: 'Freemium' },
		{ value: 'usage_based', label: 'Usage-based' },
		{ value: 'enterprise', label: 'Enterprise' }
	];

	const apiTypeOptions = ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'SDK-only'];

	// Categories scoped to the currently selected vertical
	const categories = $derived(
		filterStore.state.vertical?.categories ?? []
	);
</script>

<aside
	class="flex flex-col gap-6 {extraClass}"
	aria-label="Filter tools"
>
	<!-- Vertical selector -->
	<fieldset class="flex flex-col gap-2">
		<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
			Vertical
		</legend>
		<div class="flex flex-col gap-1">
			<button
				type="button"
				onclick={() => filterStore.setVertical(null)}
				class="text-left px-2.5 py-1.5 text-sm transition-colors
				       {filterStore.state.vertical === null
					? 'text-[--color-text] bg-[--color-surface] font-medium'
					: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
				style="border-radius: var(--radius-button);"
			>
				All verticals
			</button>
			{#each activeVerticals as v (v.id)}
				{@const active = filterStore.state.vertical?.id === v.id}
				{@const color = v.accent_colour ?? 'var(--color-primary)'}
				<button
					type="button"
					onclick={() => filterStore.setVertical(active ? null : v)}
					class="text-left px-2.5 py-1.5 text-sm transition-colors
					       {active
						? 'font-medium'
						: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
					style="border-radius: var(--radius-button); {active ? `color: ${color}; background-color: color-mix(in srgb, ${color} 10%, transparent);` : ''}"
				>
					{v.name}
				</button>
			{/each}
		</div>
	</fieldset>

	<!-- Category (appears only when a vertical is selected) -->
	{#if categories.length > 0}
		<fieldset class="flex flex-col gap-2">
			<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
				Category
			</legend>
			<div class="flex flex-col gap-1">
				<button
					type="button"
					onclick={() => filterStore.setCategory(null)}
					class="text-left px-2.5 py-1.5 text-sm transition-colors
					       {filterStore.state.category === null
						? 'text-[--color-text] bg-[--color-surface] font-medium'
						: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
					style="border-radius: var(--radius-button);"
				>
					All categories
				</button>
				{#each categories as cat (cat.id)}
					{@const active = filterStore.state.category?.id === cat.id}
					<button
						type="button"
						onclick={() => filterStore.setCategory(active ? null : cat)}
						class="text-left px-2.5 py-1.5 text-sm transition-colors
						       {active
							? 'text-[--color-text] bg-[--color-surface] font-medium'
							: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
						style="border-radius: var(--radius-button);"
					>
						{cat.name}
						{#if cat.tool_count !== undefined}
							<span class="text-xs text-[--color-text-muted] ml-1">({cat.tool_count})</span>
						{/if}
					</button>
				{/each}
			</div>
		</fieldset>
	{/if}

	<!-- ═══ Dynamic vertical-specific attribute filters ═══════════════════ -->
	<!--
		This is the core extensibility mechanism. When Jeremy adds a new
		attribute definition to a vertical via admin (e.g. "Payment Methods"
		for the Payments vertical), a new filter control appears here
		automatically — no frontend code changes.
	-->
	{#each filterableDefs as def (def.id)}
		<DynamicAttributeFilter
			definition={def}
			value={filterStore.state.attributes[def.key] ?? null}
			onchange={(key, value) => filterStore.setAttribute(key, value)}
		/>
	{/each}

	<!-- ═══ Universal filters (always visible) ═══════════════════════════ -->

	<!-- Region -->
	{#if regions.length > 0}
		<fieldset class="flex flex-col gap-2">
			<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
				Region
			</legend>
			<select
				value={filterStore.state.region ?? ''}
				onchange={(e) => {
					const v = (e.target as HTMLSelectElement).value;
					filterStore.setRegion(v || null);
				}}
				class="h-8 px-2 text-sm bg-[--color-surface] border border-[--color-border]
				       text-[--color-text] focus:outline-none focus:border-[--color-primary]
				       transition-colors appearance-none"
				style="border-radius: var(--radius-button);"
			>
				<option value="">All regions</option>
				{#each regions as r (r.id)}
					<option value={r.slug}>{r.name}</option>
				{/each}
			</select>
		</fieldset>
	{/if}

	<!-- API Type -->
	<fieldset class="flex flex-col gap-2">
		<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
			API Type
		</legend>
		<div class="flex flex-col gap-1.5">
			{#each apiTypeOptions as opt}
				{@const active = filterStore.state.apiType === opt}
				<label
					class="flex items-center gap-2 cursor-pointer text-sm
					       {active ? 'text-[--color-text]' : 'text-[--color-text-muted]'}
					       hover:text-[--color-text] transition-colors"
				>
					<input
						type="radio"
						name="filter-api-type"
						checked={active}
						onchange={() => filterStore.setApiType(active ? null : opt)}
						class="w-3.5 h-3.5 accent-[--color-primary] shrink-0"
					/>
					<span>{opt}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<!-- Pricing Model -->
	<fieldset class="flex flex-col gap-2">
		<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
			Pricing
		</legend>
		<div class="flex flex-col gap-1.5">
			{#each pricingOptions as opt}
				{@const active = filterStore.state.pricingModel === opt.value}
				<label
					class="flex items-center gap-2 cursor-pointer text-sm
					       {active ? 'text-[--color-text]' : 'text-[--color-text-muted]'}
					       hover:text-[--color-text] transition-colors"
				>
					<input
						type="radio"
						name="filter-pricing"
						checked={active}
						onchange={() => filterStore.setPricingModel(active ? null : opt.value)}
						class="w-3.5 h-3.5 accent-[--color-primary] shrink-0"
					/>
					<span>{opt.label}</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<!-- Has Public API toggle -->
	<fieldset class="flex flex-col gap-2">
		<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
			API Access
		</legend>
		<label class="flex items-center gap-2 cursor-pointer text-sm text-[--color-text-muted]">
			<button
				type="button"
				role="switch"
				aria-checked={filterStore.state.hasPublicApi === true}
				aria-label="Has public API"
				onclick={() =>
					filterStore.setHasPublicApi(
						filterStore.state.hasPublicApi === true ? null : true
					)}
				class="relative inline-flex h-5 w-9 shrink-0 items-center transition-colors
				       {filterStore.state.hasPublicApi === true ? 'bg-[--color-primary]' : 'bg-[--color-border]'}"
				style="border-radius: 10px;"
			>
				<span
					class="inline-block h-3.5 w-3.5 bg-white transition-transform"
					style="
					  border-radius: 50%;
					  transform: translateX({filterStore.state.hasPublicApi === true ? '18px' : '3px'});
					"
					aria-hidden="true"
				></span>
			</button>
			<span class="{filterStore.state.hasPublicApi === true ? 'text-[--color-text]' : ''}">
				Has public API
			</span>
		</label>
	</fieldset>

	<!-- Clear all -->
	{#if filterStore.hasActiveFilters}
		<button
			type="button"
			onclick={() => filterStore.reset()}
			class="mt-2 text-sm text-[--color-text-muted] hover:text-[--color-primary] transition-colors"
		>
			Clear all filters
		</button>
	{/if}
</aside>
