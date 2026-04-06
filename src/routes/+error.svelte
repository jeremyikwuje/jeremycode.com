<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';

	const is404 = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} — Jeremy Code</title>
</svelte:head>

<div class="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
	<p
		class="text-8xl font-bold tabular-nums"
		style="color: var(--color-primary); font-family: var(--font-display); opacity: 0.25;"
		aria-hidden="true"
	>
		{page.status}
	</p>

	<h1
		class="mt-4 text-2xl sm:text-3xl font-bold text-[--color-text]"
		style="font-family: var(--font-display);"
	>
		{#if is404}
			Page not found
		{:else}
			Something went wrong
		{/if}
	</h1>

	<p class="mt-3 text-sm text-[--color-text-muted] max-w-sm leading-relaxed">
		{#if is404}
			{page.error?.message ?? "We couldn't find that page. It may have moved or never existed."}
		{:else}
			{page.error?.message ?? 'An unexpected error occurred. Please try again in a moment.'}
		{/if}
	</p>

	<div class="flex items-center gap-3 mt-8">
		<Button href="/">Go home</Button>
		<Button href="/tools" variant="ghost">Browse tools</Button>
	</div>
</div>
