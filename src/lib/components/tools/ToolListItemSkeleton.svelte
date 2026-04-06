<script lang="ts">
	interface Props {
		count?: number;
	}

	let { count = 8 }: Props = $props();
</script>

{#each { length: count } as _, i}
	<div
		class="flex items-center gap-4 px-4 py-4 sm:px-5
		       bg-[--color-surface] border border-[--color-border] animate-pulse"
		style="border-radius: var(--radius-card);"
		aria-hidden="true"
	>
		<!-- Rank -->
		<span class="hidden sm:block w-6 h-4 bg-[--color-surface-alt]" style="border-radius: 3px;"></span>

		<!-- Logo -->
		<span
			class="shrink-0 w-12 h-12 bg-[--color-surface-alt]"
			style="border-radius: var(--radius-card);"
		></span>

		<!-- Text -->
		<div class="flex-1 min-w-0 flex flex-col gap-2">
			<div class="flex items-center gap-3">
				<span class="h-4 bg-[--color-surface-alt]" style="border-radius: 3px; width: {120 + (i % 3) * 40}px;"></span>
				<span class="hidden sm:block h-3 bg-[--color-surface-alt]" style="border-radius: 3px; width: {160 + (i % 4) * 30}px;"></span>
			</div>
			<div class="flex gap-1.5">
				<span class="h-5 w-20 bg-[--color-surface-alt]" style="border-radius: var(--radius-badge);"></span>
				<span class="h-5 w-24 bg-[--color-surface-alt]" style="border-radius: var(--radius-badge);"></span>
				<span class="hidden sm:block h-5 w-14 bg-[--color-surface-alt]" style="border-radius: var(--radius-badge);"></span>
			</div>
		</div>
	</div>
{/each}
