<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends Omit<HTMLInputAttributes, 'class'> {
		label?: string;
		error?: string | null;
		hint?: string;
		leadingIcon?: Snippet;
		trailingIcon?: Snippet;
		class?: string;
	}

	let {
		label,
		error = null,
		hint,
		leadingIcon,
		trailingIcon,
		class: extraClass = '',
		id,
		...rest
	}: Props = $props();

	// Stable id — derived so it reacts if `id` prop changes
	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class="flex flex-col gap-1.5 {extraClass}">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-[--color-text]">
			{label}
		</label>
	{/if}

	<div class="relative flex items-center">
		{#if leadingIcon}
			<span
				class="pointer-events-none absolute left-3 flex items-center text-[--color-text-muted]"
			>
				{@render leadingIcon()}
			</span>
		{/if}

		<input
			id={inputId}
			class="w-full text-[--color-text] placeholder:text-[--color-text-muted]
			       focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
			       {leadingIcon ? 'pl-9' : 'pl-3'}
			       {trailingIcon ? 'pr-9' : 'pr-3'}
			       py-2 text-sm h-10"
			style="
			  background: var(--color-surface-1);
			  border: 1px solid var(--color-border-subtle);
			  border-radius: var(--radius-button);
			  transition: border-color 150ms ease;
			"
			onfocus={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-primary)')}
			onblur={(e) => ((e.currentTarget as HTMLInputElement).style.borderColor = 'var(--color-border-subtle)')}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby="{error ? `${inputId}-error` : ''} {hint ? `${inputId}-hint` : ''}"
			{...rest}
		/>

		{#if trailingIcon}
			<span class="absolute right-3 flex items-center text-[--color-text-muted]">
				{@render trailingIcon()}
			</span>
		{/if}
	</div>

	{#if error}
		<p id="{inputId}-error" class="text-xs text-red-400" role="alert">{error}</p>
	{:else if hint}
		<p id="{inputId}-hint" class="text-xs text-[--color-text-muted]">{hint}</p>
	{/if}
</div>
