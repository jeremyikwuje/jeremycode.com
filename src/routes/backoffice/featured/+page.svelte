<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Tool } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let featuredIds = $state<string[]>(data.featured.map((t) => t.id));
	let addModalOpen = $state(false);
	let searchQuery = $state('');

	const featuredTools = $derived(
		featuredIds.map((id) => data.allTools.find((t) => t.id === id)).filter(Boolean) as Tool[]
	);

	const availableTools = $derived(
		data.allTools.filter((t) =>
			!featuredIds.includes(t.id) &&
			(searchQuery === '' || t.name.toLowerCase().includes(searchQuery.toLowerCase()))
		)
	);

	function moveUp(index: number) {
		if (index <= 0) return;
		const next = [...featuredIds];
		[next[index - 1], next[index]] = [next[index], next[index - 1]];
		featuredIds = next;
	}

	function moveDown(index: number) {
		if (index >= featuredIds.length - 1) return;
		const next = [...featuredIds];
		[next[index], next[index + 1]] = [next[index + 1], next[index]];
		featuredIds = next;
	}

	function removeFeatured(id: string) {
		featuredIds = featuredIds.filter((fid) => fid !== id);
	}

	function addFeatured(id: string) {
		if (featuredIds.length >= 9) return;
		featuredIds = [...featuredIds, id];
		addModalOpen = false;
		searchQuery = '';
	}
</script>

<SeoHead title="Featured Tools" description="Manage featured tools" noindex />

<div class="max-w-3xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Featured Tools</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">{featuredIds.length} of 9 slots used</p>
		</div>
		<div class="flex gap-2">
			{#if featuredIds.length < 9}
				<Button variant="ghost" onclick={() => { addModalOpen = true; searchQuery = ''; }}>Add Tool</Button>
			{/if}
			<form method="POST" action="?/save" use:enhance={() => {
				return async ({ result, update }) => { if (result.type === 'success') invalidateAll(); await update(); };
			}}>
				<input type="hidden" name="ordered_ids" value={featuredIds.join(',')} />
				<Button type="submit">Save Order</Button>
			</form>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="mb-4 px-4 py-3 text-sm text-green-400 bg-[color:color-mix(in_srgb,#22c55e_10%,transparent)] border border-green-800"
			style="border-radius: var(--radius-card);">Order saved.</div>
	{/if}

	<!-- Featured grid -->
	<div class="space-y-2">
		{#each featuredTools as tool, i (tool.id)}
			{@const accent = tool.vertical.accent_colour ?? 'var(--color-primary)'}
			<div class="flex items-center gap-3 p-3 bg-[--color-surface] border border-[--color-border] transition-colors" style="border-radius: var(--radius-card);">
				<span class="w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold text-[--color-text-muted] bg-[--color-surface-alt]" style="border-radius: var(--radius-badge);">
					{i + 1}
				</span>
				{#if tool.logo_url}
					<img src={tool.logo_url} alt="" width="24" height="24" class="shrink-0 object-contain" style="border-radius: var(--radius-badge);" />
				{/if}
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-[--color-text] truncate">{tool.name}</p>
					<p class="text-xs text-[--color-text-muted]" style="color: {accent};">{tool.vertical.name}</p>
				</div>
				<div class="flex items-center gap-1">
					<button onclick={() => moveUp(i)} disabled={i === 0}
						class="w-7 h-7 flex items-center justify-center text-[--color-text-muted] hover:text-[--color-text] disabled:opacity-30 transition-colors" aria-label="Move up">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
					</button>
					<button onclick={() => moveDown(i)} disabled={i === featuredIds.length - 1}
						class="w-7 h-7 flex items-center justify-center text-[--color-text-muted] hover:text-[--color-text] disabled:opacity-30 transition-colors" aria-label="Move down">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
					</button>
					<button onclick={() => removeFeatured(tool.id)}
						class="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors" aria-label="Remove">
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				</div>
			</div>
		{:else}
			<div class="py-12 text-center text-[--color-text-muted] bg-[--color-surface] border border-[--color-border]" style="border-radius: var(--radius-card);">
				No featured tools. Add up to 9.
			</div>
		{/each}
	</div>
</div>

<!-- Add Tool Modal -->
<AdminModal open={addModalOpen} title="Add Featured Tool" onclose={() => (addModalOpen = false)}>
	<input type="text" placeholder="Search tools..." bind:value={searchQuery}
		class="w-full h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] mb-3"
		style="border-radius: var(--radius-button);" />

	<div class="max-h-64 overflow-y-auto space-y-1">
		{#each availableTools.slice(0, 20) as tool (tool.id)}
			<button onclick={() => addFeatured(tool.id)}
				class="w-full flex items-center gap-3 p-2 text-left hover:bg-[--color-surface-alt] transition-colors text-sm"
				style="border-radius: var(--radius-button);">
				<span class="font-medium text-[--color-text]">{tool.name}</span>
				<span class="text-xs text-[--color-text-muted]">{tool.vertical.name}</span>
			</button>
		{:else}
			<p class="py-4 text-center text-sm text-[--color-text-muted]">No matching tools.</p>
		{/each}
	</div>
</AdminModal>
