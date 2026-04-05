<script lang="ts">
	/**
	 * Mobile slide-up drawer that wraps FilterPanel.
	 * Renders the same panel; just adds the drawer chrome + backdrop.
	 */
	import { uiStore } from '$lib/stores/index.js';
	import FilterPanel from './FilterPanel.svelte';
	import type { Vertical, Region } from '$lib/types/index.js';

	interface Props {
		verticals: Vertical[];
		regions: Region[];
	}

	let { verticals, regions }: Props = $props();

	function close() {
		uiStore.closeFilterDrawer();
	}

	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}
</script>

{#if uiStore.filterDrawerOpen}
	<div
		role="presentation"
		class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
		onclick={handleBackdrop}
	>
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Filter tools"
			class="absolute bottom-0 inset-x-0 max-h-[85vh] overflow-y-auto
			       bg-[--color-bg] border-t border-[--color-border]"
			style="border-radius: var(--radius-card) var(--radius-card) 0 0;"
		>
			<!-- Drag handle -->
			<div class="flex justify-center pt-3 pb-1 sticky top-0 bg-[--color-bg] z-10">
				<span
					class="w-10 h-1 bg-[--color-border]"
					style="border-radius: 2px;"
					aria-hidden="true"
				></span>
			</div>

			<!-- Close button -->
			<div class="flex items-center justify-between px-4 pb-3 sticky top-5 bg-[--color-bg] z-10">
				<h2 class="text-sm font-semibold text-[--color-text]">Filters</h2>
				<button
					type="button"
					onclick={close}
					aria-label="Close filters"
					class="w-8 h-8 flex items-center justify-center
					       text-[--color-text-muted] hover:text-[--color-text] transition-colors"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<FilterPanel
				{verticals}
				{regions}
				class="px-4 pb-6"
			/>
		</div>
	</div>
{/if}
