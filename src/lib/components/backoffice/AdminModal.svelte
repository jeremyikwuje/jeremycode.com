<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title: string;
		onclose: () => void;
		children: Snippet;
		/** Optional footer snippet (e.g. submit buttons) */
		footer?: Snippet;
		/** Width class — defaults to max-w-lg */
		width?: string;
	}

	let {
		open,
		title,
		onclose,
		children,
		footer,
		width = 'max-w-lg'
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
		onkeydown={handleKeydown}
	>
		<div
			class="fixed inset-0 bg-black/60"
			role="presentation"
			onclick={onclose}
		></div>

		<!-- Dialog -->
		<div
			class="relative w-full {width} bg-[--color-surface] border border-[--color-border] shadow-xl flex flex-col max-h-[80vh]"
			style="border-radius: var(--radius-card);"
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-6 py-4 border-b border-[--color-border] shrink-0">
				<h2 class="text-base font-semibold text-[--color-text]" style="font-family: var(--font-display);">
					{title}
				</h2>
				<button
					type="button"
					onclick={onclose}
					class="text-[--color-text-muted] hover:text-[--color-text] transition-colors"
					aria-label="Close"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
						stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<!-- Body -->
			<div class="overflow-y-auto px-6 py-5">
				{@render children()}
			</div>

			<!-- Footer -->
			{#if footer}
				<div class="px-6 py-4 border-t border-[--color-border] shrink-0 flex justify-end gap-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
