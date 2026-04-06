<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
	type Size = 'sm' | 'md' | 'lg';

	interface BaseProps {
		variant?: Variant;
		size?: Size;
		disabled?: boolean;
		class?: string;
		children: Snippet;
	}

	type Props =
		| (BaseProps & { href: string } & Omit<HTMLAnchorAttributes, keyof BaseProps | 'href'>)
		| (BaseProps & { href?: undefined } & Omit<HTMLButtonAttributes, keyof BaseProps>);

	let {
		variant = 'primary',
		size = 'md',
		disabled = false,
		href,
		class: extraClass = '',
		children,
		...rest
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary] disabled:pointer-events-none disabled:opacity-50';

	const sizes: Record<Size, string> = {
		sm: 'h-8 px-3 text-sm gap-1.5',
		md: 'h-10 px-4 text-sm gap-2',
		lg: 'h-12 px-6 text-base gap-2'
	};

	const variantClasses: Record<Variant, string> = {
		primary:     'font-semibold hover:opacity-90 active:opacity-80',
		secondary:   'hover:opacity-90 active:opacity-80',
		ghost:       'btn-ghost',
		destructive: 'hover:opacity-90 active:opacity-80'
	};

	const variantStyles: Record<Variant, string> = {
		primary:     'background-color: var(--color-primary); color: #000;',
		secondary:   'background-color: var(--color-secondary); color: #fff;',
		ghost:       'background-color: var(--color-surface-1); color: var(--color-text-secondary);',
		destructive: 'background-color: #dc2626; color: #fff;'
	};

	const classes = $derived(
		[base, sizes[size], variantClasses[variant], extraClass].filter(Boolean).join(' ')
	);

	const variantStyle = $derived(variantStyles[variant]);
</script>

{#if href}
	<a
		{href}
		class={classes}
		style="border-radius: var(--radius-button); {variantStyle}"
		aria-disabled={disabled || undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render children()}
	</a>
{:else}
	<button
		class={classes}
		style="border-radius: var(--radius-button); {variantStyle}"
		{disabled}
		{...rest as HTMLButtonAttributes}
	>
		{@render children()}
	</button>
{/if}
