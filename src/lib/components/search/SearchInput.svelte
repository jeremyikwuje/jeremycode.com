<script lang="ts">
	import { uiStore } from '$lib/stores/index.js';

	interface Props {
		/** Rendered inline (e.g. on /tools page) vs. as a CMD+K trigger pill */
		mode?: 'trigger' | 'inline';
		placeholder?: string;
		class?: string;
	}

	let { mode = 'trigger', placeholder = 'Search tools…', class: extraClass = '' }: Props =
		$props();
</script>

{#if mode === 'trigger'}
	<!--
		Pill button — sits in GlobalNav, opens CommandPalette on click.
		On mobile the trigger is hidden; the hamburger menu has a full-width variant.
	-->
	<button
		type="button"
		onclick={() => uiStore.openSearchPalette()}
		aria-label="Open search (Cmd+K)"
		class="hidden md:flex items-center gap-2 h-9 px-3 text-sm text-[--color-text-muted]
		       bg-[--color-surface] border border-[--color-border]
		       hover:border-[--color-primary] hover:text-[--color-text]
		       transition-colors {extraClass}"
		style="border-radius: var(--radius-button);"
	>
		<!-- Magnifying glass icon -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
		<span class="hidden lg:inline">{placeholder}</span>
		<kbd
			class="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs
			       bg-[--color-surface-alt] border border-[--color-border]
			       text-[--color-text-muted] font-mono leading-none"
			style="border-radius: 4px;"
		>
			<span class="text-base leading-none">⌘</span>K
		</kbd>
	</button>
{:else}
	<!--
		Inline mode — standalone input for use on /tools page search bar.
		Clicking also opens the CommandPalette.
	-->
	<div class="relative flex items-center {extraClass}">
		<span class="pointer-events-none absolute left-3 text-[--color-text-muted]">
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
				<circle cx="11" cy="11" r="8" />
				<line x1="21" y1="21" x2="16.65" y2="16.65" />
			</svg>
		</span>
		<input
			type="search"
			readonly
			{placeholder}
			onclick={() => uiStore.openSearchPalette()}
			class="w-full h-11 pl-10 pr-4 text-sm cursor-pointer
			       bg-[--color-surface] text-[--color-text] placeholder:text-[--color-text-muted]
			       border border-[--color-border] hover:border-[--color-primary]
			       focus:outline-none focus:border-[--color-primary]
			       transition-colors"
			style="border-radius: var(--radius-button);"
		/>
		<kbd
			class="absolute right-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs
			       bg-[--color-surface-alt] border border-[--color-border]
			       text-[--color-text-muted] font-mono leading-none pointer-events-none"
			style="border-radius: 4px;"
		>
			<span class="text-base leading-none">⌘</span>K
		</kbd>
	</div>
{/if}
