<script lang="ts">
	import { uiStore, searchStore } from '$lib/stores/index.js';
	import { goto } from '$app/navigation';
	import type { Tool } from '$lib/types/index.js';

	let query = $state('');
	let selectedIndex = $state(0);
	let loading = $state(false);
	let inputEl: HTMLInputElement | undefined = $state();

	// Focus input whenever palette opens
	$effect(() => {
		if (uiStore.searchPaletteOpen) {
			// Tick needed so the element is visible before we focus
			setTimeout(() => inputEl?.focus(), 10);
			// Lazily load tools on first open
			if (!searchStore.isReady && !loading) {
				loadTools();
			}
		} else {
			// Reset on close
			query = '';
			selectedIndex = 0;
			searchStore.clear();
		}
	});

	async function loadTools() {
		loading = true;
		try {
			const res = await fetch('/api/search-index');
			if (res.ok) {
				const tools = (await res.json()) as Tool[];
				await searchStore.init(tools);
			}
		} finally {
			loading = false;
		}
	}

	// Keep search results in sync with query
	$effect(() => {
		searchStore.search(query);
		selectedIndex = 0;
	});

	const results = $derived(searchStore.results.slice(0, 8));

	function close() {
		uiStore.closeSearchPalette();
	}

	function selectResult(tool: Tool) {
		close();
		goto(`/tools/${tool.slug}`);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!uiStore.searchPaletteOpen) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const tool = results[selectedIndex];
			if (tool) selectResult(tool);
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	// Fallback first-letter avatar when logo_url is null
	function toolInitial(name: string) {
		return name.charAt(0).toUpperCase();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if uiStore.searchPaletteOpen}
	<!-- Backdrop — role="presentation" because the dialog handles its own a11y -->
	<div
		role="presentation"
		class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4
		       bg-black/60 backdrop-blur-sm"
		onclick={handleBackdropClick}
	>
		<!-- Panel -->
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Search tools"
			class="w-full max-w-xl overflow-hidden shadow-2xl"
			style="
			  background: var(--color-surface-3);
			  border: 1px solid var(--color-border-hover);
			  border-radius: var(--radius-card);
			  box-shadow: 0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.7);
			"
		>
			<!-- Input row -->
			<div
				class="flex items-center gap-3 px-4"
				style="border-bottom: 1px solid var(--color-border-subtle);"
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
					class="shrink-0 text-[--color-text-muted]"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="search"
					placeholder="Search tools…"
					class="flex-1 h-14 bg-transparent text-[--color-text] placeholder:text-[--color-text-muted]
					       text-base focus:outline-none"
				/>
				{#if loading}
					<span class="text-xs text-[--color-text-muted]">Loading…</span>
				{/if}
				<kbd
					class="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs
					       text-[--color-text-muted] font-mono leading-none"
					style="background: var(--color-surface-2); border-radius: 4px;"
				>
					Esc
				</kbd>
			</div>

			<!-- Results -->
			{#if results.length > 0}
				<ul role="listbox" aria-label="Search results" class="py-2 max-h-96 overflow-y-auto">
					{#each results as tool, i (tool.id)}
						<li role="option" aria-selected={i === selectedIndex}>
							<button
								type="button"
								onclick={() => selectResult(tool)}
								onmouseenter={() => (selectedIndex = i)}
								class="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
								       {i === selectedIndex
									? 'bg-[--color-surface-2]'
									: 'hover:bg-[--color-surface-2]'}"
							>
								<!-- Logo / fallback avatar -->
								{#if tool.logo_url}
									<img
										src={tool.logo_url}
										alt=""
										width="32"
										height="32"
										class="shrink-0 object-contain"
										style="border-radius: var(--radius-badge);"
									/>
								{:else}
									<span
										class="shrink-0 w-8 h-8 flex items-center justify-center
										       bg-[--color-surface-2] text-[--color-text-muted] text-sm font-bold"
										style="border-radius: var(--radius-badge);"
									>
										{toolInitial(tool.name)}
									</span>
								{/if}

								<!-- Text -->
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium text-[--color-text] truncate">{tool.name}</p>
									<p class="text-xs text-[--color-text-muted] truncate">{tool.tagline}</p>
								</div>

								<!-- Vertical badge -->
								{#if tool.vertical}
									<span
										class="shrink-0 hidden sm:inline-flex items-center px-2 py-0.5
										       text-xs font-medium"
										style="
										  border-radius: var(--radius-badge);
										  background-color: color-mix(in srgb, {tool.vertical.accent_colour ?? 'var(--color-primary)'} 20%, transparent);
										  color: {tool.vertical.accent_colour ?? 'var(--color-primary)'};
										"
									>
										{tool.vertical.name}
									</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{:else if query && !loading}
				<p class="px-4 py-10 text-center text-sm text-[--color-text-muted]">
					No tools found for "<strong class="text-[--color-text]">{query}</strong>"
				</p>
			{:else if !searchStore.isReady && !loading}
				<p class="px-4 py-10 text-center text-sm text-[--color-text-muted]">
					Type to search all fintech tools…
				</p>
			{/if}

			<!-- Footer hint -->
			<div
				class="flex items-center gap-4 px-4 py-2 text-xs text-[--color-text-muted]"
			style="border-top: 1px solid var(--color-border-subtle);"
			>
				<span class="flex items-center gap-1">
					<kbd class="font-mono px-1 py-0.5" style="background: var(--color-surface-2); border-radius:3px;">↑↓</kbd>
					navigate
				</span>
				<span class="flex items-center gap-1">
					<kbd class="font-mono px-1 py-0.5" style="background: var(--color-surface-2); border-radius:3px;">↵</kbd>
					open
				</span>
				<span class="flex items-center gap-1">
					<kbd class="font-mono px-1 py-0.5" style="background: var(--color-surface-2); border-radius:3px;">Esc</kbd>
					close
				</span>
			</div>
		</div>
	</div>
{/if}
