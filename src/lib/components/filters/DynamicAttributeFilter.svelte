<script lang="ts">
	/**
	 * Renders a single filter control for a dynamic attribute definition.
	 *
	 * The control type is determined entirely by the AttributeDefinition's
	 * value_type — no hardcoded knowledge of any vertical's attributes.
	 *
	 *   multi_select  → checkbox group of allowed_values
	 *   single_select → radio group of allowed_values
	 *   boolean       → toggle switch
	 *   text          → text input (rare for filterable attributes)
	 */
	import type { AttributeDefinition, AttributeValue } from '$lib/types/index.js';

	interface Props {
		definition: AttributeDefinition;
		value: AttributeValue | null;
		onchange: (key: string, value: AttributeValue | null) => void;
	}

	let { definition, value, onchange }: Props = $props();

	// ── Multi-select helpers ──────────────────────────────────────────────────

	const selectedSet = $derived(
		new Set(Array.isArray(value) ? value : [])
	);

	function toggleMulti(option: string) {
		const next = new Set(selectedSet);
		if (next.has(option)) {
			next.delete(option);
		} else {
			next.add(option);
		}
		onchange(definition.key, next.size > 0 ? Array.from(next) : null);
	}

	// ── Single-select helper ──────────────────────────────────────────────────

	function selectSingle(option: string) {
		onchange(definition.key, value === option ? null : option);
	}

	// ── Boolean helper ────────────────────────────────────────────────────────

	function toggleBool() {
		if (value === true) {
			onchange(definition.key, null);
		} else {
			onchange(definition.key, true);
		}
	}

	// ── Text helper ───────────────────────────────────────────────────────────

	function handleText(e: Event) {
		const input = e.target as HTMLInputElement;
		onchange(definition.key, input.value || null);
	}

	// Unique name for radio groups
	const groupName = $derived(`attr-filter-${definition.key}`);
</script>

<fieldset class="flex flex-col gap-2">
	<legend class="text-xs font-semibold text-[--color-text-muted] uppercase tracking-wider mb-1">
		{definition.display_name}
	</legend>

	{#if definition.value_type === 'multi_select'}
		<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
			{#each definition.allowed_values as option}
				{@const checked = selectedSet.has(option)}
				<label
					class="flex items-center gap-2 cursor-pointer text-sm
					       {checked ? 'text-[--color-text]' : 'text-[--color-text-muted]'}
					       hover:text-[--color-text] transition-colors"
				>
					<input
						type="checkbox"
						{checked}
						onchange={() => toggleMulti(option)}
						class="w-3.5 h-3.5 accent-[--color-primary] shrink-0"
					/>
					<span class="truncate">{option}</span>
				</label>
			{/each}
		</div>

	{:else if definition.value_type === 'single_select'}
		<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
			{#each definition.allowed_values as option}
				{@const checked = value === option}
				<label
					class="flex items-center gap-2 cursor-pointer text-sm
					       {checked ? 'text-[--color-text]' : 'text-[--color-text-muted]'}
					       hover:text-[--color-text] transition-colors"
				>
					<input
						type="radio"
						name={groupName}
						{checked}
						onchange={() => selectSingle(option)}
						class="w-3.5 h-3.5 accent-[--color-primary] shrink-0"
					/>
					<span class="truncate">{option}</span>
				</label>
			{/each}
		</div>

	{:else if definition.value_type === 'boolean'}
		<label class="flex items-center gap-2 cursor-pointer text-sm text-[--color-text-muted]">
			<button
				type="button"
				role="switch"
				aria-checked={value === true}
				aria-label={definition.display_name}
				onclick={toggleBool}
				class="relative inline-flex h-5 w-9 shrink-0 items-center transition-colors
				       {value === true ? 'bg-[--color-primary]' : 'bg-[--color-border]'}"
				style="border-radius: 10px;"
			>
				<span
					class="inline-block h-3.5 w-3.5 bg-white transition-transform"
					style="
					  border-radius: 50%;
					  transform: translateX({value === true ? '18px' : '3px'});
					"
					aria-hidden="true"
				></span>
			</button>
			<span class="{value === true ? 'text-[--color-text]' : ''}">
				{definition.display_name}
			</span>
		</label>

	{:else}
		<!-- text type — uncommon for filters but supported -->
		<input
			type="text"
			value={typeof value === 'string' ? value : ''}
			oninput={handleText}
			placeholder="Filter by {definition.display_name.toLowerCase()}…"
			class="h-8 px-2.5 text-sm bg-[--color-surface] border border-[--color-border]
			       text-[--color-text] placeholder:text-[--color-text-muted]
			       focus:outline-none focus:border-[--color-primary] transition-colors"
			style="border-radius: var(--radius-button);"
		/>
	{/if}
</fieldset>
