<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let createOpen = $state(false);
	let deleteConfirmId = $state<string | null>(null);

	function toolName(id: string): string {
		return data.tools.find((t) => t.id === id)?.name ?? id;
	}
</script>

<SeoHead title="Comparisons" description="Manage comparisons" noindex />

<div class="max-w-5xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Comparisons</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">{data.total} comparison{data.total === 1 ? '' : 's'}</p>
		</div>
		<Button onclick={() => (createOpen = true)}>New Comparison</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tool A</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">vs</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tool B</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Slug</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.comparisons as comp (comp.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4 font-medium text-[--color-text]">{toolName(comp.tool_a_id)}</td>
						<td class="py-3 px-4 text-center text-[--color-text-muted]">vs</td>
						<td class="py-3 px-4 font-medium text-[--color-text]">{toolName(comp.tool_b_id)}</td>
						<td class="py-3 px-4 text-[--color-text-muted] font-mono text-xs">{comp.slug}</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<a href="/compare/{comp.slug}" target="_blank" rel="noopener" class="text-xs text-[--color-text-muted] hover:text-[--color-text]">View</a>
								<button onclick={() => (deleteConfirmId = comp.id)} class="text-xs text-red-400 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="py-12 text-center text-[--color-text-muted]">No comparisons yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Create Modal -->
<AdminModal open={createOpen} title="New Comparison" onclose={() => (createOpen = false)}>
	<form method="POST" action="?/create"
		use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { createOpen = false; invalidateAll(); } await update(); }; }}
		class="flex flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<label for="comp-a" class="text-sm font-medium text-[--color-text]">Tool A *</label>
			<select id="comp-a" name="tool_a_id" class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]" style="border-radius: var(--radius-button);" required>
				<option value="" disabled selected>Select tool</option>
				{#each data.tools as t (t.id)}<option value={t.id}>{t.name} ({t.vertical.name})</option>{/each}
			</select>
		</div>
		<div class="flex flex-col gap-1.5">
			<label for="comp-b" class="text-sm font-medium text-[--color-text]">Tool B *</label>
			<select id="comp-b" name="tool_b_id" class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]" style="border-radius: var(--radius-button);" required>
				<option value="" disabled selected>Select tool</option>
				{#each data.tools as t (t.id)}<option value={t.id}>{t.name} ({t.vertical.name})</option>{/each}
			</select>
		</div>
		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={() => (createOpen = false)}>Cancel</Button>
			<Button type="submit">Create</Button>
		</div>
	</form>
</AdminModal>

<AdminModal open={deleteConfirmId !== null} title="Delete Comparison" onclose={() => (deleteConfirmId = null)}>
	<p class="text-sm text-[--color-text-muted] mb-4">Delete this comparison?</p>
	<form method="POST" action="?/delete" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); } await update(); }; }}>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
