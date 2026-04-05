<script lang="ts">
	import { enhance } from '$app/forms';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { ActionData } from './$types.js';

	let { form }: { form: ActionData } = $props();

	const errors = $derived((form?.errors ?? {}) as Record<string, string>);
	const values = $derived((form?.values ?? {}) as Record<string, string>);

	let loading = $state(false);
</script>

<SeoHead
	title="Login"
	description="Admin login for Jeremy Code backoffice."
	noindex
/>

<div class="min-h-screen flex items-center justify-center px-4">
	<div
		class="w-full max-w-sm p-8 bg-[--color-surface] border border-[--color-border]"
		style="border-radius: var(--radius-card);"
	>
		<div class="mb-8 text-center">
			<h1
				class="text-2xl font-bold text-[--color-text]"
				style="font-family: var(--font-display);"
			>
				Jeremy Code
			</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">Backoffice login</p>
		</div>

		{#if errors._form}
			<div
				class="mb-6 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
				style="border-radius: var(--radius-card);"
				role="alert"
			>
				{errors._form}
			</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}
			class="flex flex-col gap-5"
		>
			<Input
				name="email"
				label="Email"
				type="email"
				autocomplete="email"
				placeholder="you@example.com"
				value={values.email ?? ''}
				error={errors.email ?? null}
				required
			/>

			<Input
				name="password"
				label="Password"
				type="password"
				autocomplete="current-password"
				placeholder="Enter password"
				error={errors.password ?? null}
				required
			/>

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign in'}
			</Button>
		</form>

		<p class="mt-6 text-center text-xs text-[--color-text-muted]">
			<a href="/" class="hover:text-[--color-text] transition-colors">
				&larr; Back to site
			</a>
		</p>
	</div>
</div>
