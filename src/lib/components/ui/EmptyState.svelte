<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center" role="status">
	<!-- Empty icon -->
	<div
		class="w-14 h-14 flex items-center justify-center mb-5
		       bg-[--color-surface] border border-[--color-border]"
		style="border-radius: var(--radius-card);"
		aria-hidden="true"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-[--color-text-muted]"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
			<line x1="11" y1="8" x2="11" y2="14" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	</div>

	<p class="text-base font-semibold text-[--color-text]">{title}</p>

	{#if description}
		<p class="mt-2 text-sm text-[--color-text-muted] max-w-xs leading-relaxed">
			{description}
		</p>
	{/if}

	{#if children}
		<div class="mt-6">
			{@render children()}
		</div>
	{/if}
</div>
