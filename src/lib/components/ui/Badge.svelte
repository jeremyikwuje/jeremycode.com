<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'vertical' | 'category' | 'api' | 'region' | 'verified';

	interface Props {
		variant?: Variant;
		class?: string;
		children: Snippet;
	}

	let { variant = 'default', class: extraClass = '', children }: Props = $props();

	const base =
		'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium leading-none whitespace-nowrap';

	const variants: Record<Variant, string> = {
		default: 'bg-[--color-surface-alt] text-[--color-text-muted]',
		vertical: 'text-white',
		category:
			'bg-[color:color-mix(in_srgb,var(--color-secondary)_15%,transparent)] text-[--color-secondary]',
		api: 'border border-[--color-secondary] text-[--color-secondary]',
		region:
			'bg-[color:color-mix(in_srgb,var(--color-accent-green)_15%,transparent)] text-[--color-accent-green]',
		verified:
			'bg-[color:color-mix(in_srgb,var(--color-accent-green)_20%,transparent)] text-[--color-accent-green]'
	};

	const style = $derived(
		variant === 'vertical'
			? 'background-color: color-mix(in srgb, var(--vertical-color) 25%, transparent); color: var(--vertical-color); border-radius: var(--radius-badge);'
			: 'border-radius: var(--radius-badge);'
	);

	const classes = $derived([base, variants[variant], extraClass].filter(Boolean).join(' '));
</script>

<span class={classes} {style}>
	{@render children()}
</span>
