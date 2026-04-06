<script lang="ts">
	/**
	 * Lightweight pill for secondary tags, SDK languages, regions, etc.
	 * Distinct from Badge: TagBadge is data-only (no variant logic for
	 * verticals or categories), supports optional removal.
	 */
	interface Props {
		label: string;
		/** Override the default muted look with a custom colour */
		colour?: string;
		/** Show × button and fire onremove */
		removable?: boolean;
		onremove?: () => void;
		class?: string;
	}

	let { label, colour, removable = false, onremove, class: extraClass = '' }: Props = $props();

	const style = $derived(
		colour
			? `background-color: color-mix(in srgb, ${colour} 15%, transparent); color: ${colour}; border-radius: var(--radius-badge);`
			: 'border-radius: var(--radius-badge);'
	);

	const classes = $derived(
		[
			'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
			colour ? '' : 'bg-[--color-surface-2] text-[--color-text-muted]',
			extraClass
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<span class={classes} {style}>
	{label}
	{#if removable}
		<button
			type="button"
			onclick={onremove}
			aria-label="Remove {label}"
			class="ml-0.5 -mr-0.5 hover:text-[--color-text] transition-colors"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
	{/if}
</span>
