<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Variant = 'default' | 'elevated' | 'flush';

	interface BaseProps {
		variant?: Variant;
		href?: string;
		class?: string;
		children: Snippet;
	}

	type Props = BaseProps & Omit<HTMLAttributes<HTMLDivElement>, keyof BaseProps>;

	let { variant = 'default', href, class: extraClass = '', children, ...rest }: Props = $props();

	const base = 'block overflow-hidden transition-[border-color,box-shadow]';

	const variants: Record<Variant, string> = {
		default: 'bg-[--color-surface] border border-[--color-border]',
		elevated: 'bg-[--color-surface-alt] border border-[--color-border]',
		flush: ''
	};

	const interactive = $derived(
		href
			? 'hover:border-[--color-primary] hover:shadow-[0_0_0_1px_var(--color-primary)]'
			: ''
	);

	const classes = $derived(
		[base, variants[variant], interactive, extraClass].filter(Boolean).join(' ')
	);
</script>

{#if href}
	<a
		{href}
		class={classes}
		style="border-radius: var(--radius-card);"
		{...rest as HTMLAttributes<HTMLAnchorElement>}
	>
		{@render children()}
	</a>
{:else}
	<div class={classes} style="border-radius: var(--radius-card);" {...rest}>
		{@render children()}
	</div>
{/if}
