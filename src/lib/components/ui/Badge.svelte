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
		default:  '',
		vertical: '',
		category: '',
		api:      '',
		region:   '',
		verified: ''
	};

	// All badge colors are set via inline style for full design-token control
	const styles: Record<Variant, string> = {
		default:
			'background: var(--color-surface-2); color: var(--color-text-secondary);',
		vertical:
			'background-color: color-mix(in srgb, var(--vertical-color) 12%, transparent); color: var(--vertical-color);',
		category:
			'background-color: color-mix(in srgb, var(--color-secondary) 12%, transparent); color: var(--color-secondary);',
		api:
			'background-color: color-mix(in srgb, var(--color-secondary) 8%, transparent); color: var(--color-secondary); outline: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);',
		region:
			'background-color: color-mix(in srgb, var(--color-accent-green) 12%, transparent); color: var(--color-accent-green);',
		verified:
			'background-color: color-mix(in srgb, var(--color-accent-green) 15%, transparent); color: var(--color-accent-green);'
	};

	const classes = $derived([base, variants[variant], extraClass].filter(Boolean).join(' '));
	const style = $derived(`border-radius: var(--radius-badge); ${styles[variant]}`);
</script>

<span class={classes} {style}>
	{@render children()}
</span>
