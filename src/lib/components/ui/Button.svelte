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

	const variants: Record<Variant, string> = {
		primary: 'bg-[--color-primary] text-white hover:opacity-90 active:opacity-80',
		secondary: 'bg-[--color-secondary] text-white hover:opacity-90 active:opacity-80',
		ghost:
			'bg-transparent text-[--color-text-muted] border border-[--color-border] hover:border-[--color-primary] hover:text-[--color-text]',
		destructive: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700'
	};

	const classes = $derived(
		[base, sizes[size], variants[variant], extraClass].filter(Boolean).join(' ')
	);
</script>

{#if href}
	<a
		{href}
		class={classes}
		style="border-radius: var(--radius-button);"
		aria-disabled={disabled || undefined}
		{...rest as HTMLAnchorAttributes}
	>
		{@render children()}
	</a>
{:else}
	<button
		class={classes}
		style="border-radius: var(--radius-button);"
		{disabled}
		{...rest as HTMLButtonAttributes}
	>
		{@render children()}
	</button>
{/if}
