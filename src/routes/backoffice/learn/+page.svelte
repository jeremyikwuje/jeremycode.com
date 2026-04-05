<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { LearnContent } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingItem = $state<LearnContent | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	function openCreate() { editingItem = null; modalOpen = true; }
	function openEdit(item: LearnContent) { editingItem = item; modalOpen = true; }
	function closeModal() { modalOpen = false; editingItem = null; }
</script>

<SeoHead title="Learn Content" description="Manage learn content" noindex />

<div class="max-w-5xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Learn Content</h1>
		<Button onclick={openCreate}>New Content</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Title</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Source</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Verticals</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.content as item (item.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4">
							<a href={item.url} target="_blank" rel="noopener" class="font-medium text-[--color-text] hover:text-[--color-primary] transition-colors">{item.title}</a>
						</td>
						<td class="py-3 px-4">
							<span class="text-xs font-semibold {item.source === 'youtube' ? 'text-[--color-accent-green]' : 'text-[--color-secondary]'}">
								{item.source === 'youtube' ? 'YouTube' : 'Substack'}
							</span>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs">
							{item.associated_verticals.map((v) => v.name).join(', ') || '—'}
						</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<button onclick={() => openEdit(item)} class="text-xs text-[--color-secondary] hover:underline">Edit</button>
								<button onclick={() => (deleteConfirmId = item.id)} class="text-xs text-red-400 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="4" class="py-12 text-center text-[--color-text-muted]">No learn content yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<AdminModal open={modalOpen} title={editingItem ? 'Edit Content' : 'New Content'} onclose={closeModal}>
	<form method="POST" action={editingItem ? '?/update' : '?/create'}
		use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { closeModal(); invalidateAll(); } await update(); }; }}
		class="flex flex-col gap-4">
		{#if editingItem}<input type="hidden" name="id" value={editingItem.id} />{/if}

		<Input name="title" label="Title *" placeholder="Article or video title" value={editingItem?.title ?? ''} required />
		<Input name="url" label="URL *" type="url" placeholder="https://..." value={editingItem?.url ?? ''} required />

		<div class="flex flex-col gap-1.5">
			<label for="learn-source" class="text-sm font-medium text-[--color-text]">Source *</label>
			<select id="learn-source" name="source"
				class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
				style="border-radius: var(--radius-button);" value={editingItem?.source ?? 'substack'}>
				<option value="substack">Substack</option>
				<option value="youtube">YouTube</option>
			</select>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="learn-desc" class="text-sm font-medium text-[--color-text]">Description</label>
			<textarea id="learn-desc" name="description" rows={2}
				class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] resize-y"
				style="border-radius: var(--radius-button);" placeholder="Brief description...">{editingItem?.description ?? ''}</textarea>
		</div>

		<div class="flex flex-col gap-1.5">
			<label class="text-sm font-medium text-[--color-text]">Associated Verticals</label>
			<div class="flex flex-wrap gap-2">
				{#each data.verticals as v (v.id)}
					<label class="flex items-center gap-1.5 text-sm text-[--color-text-muted] cursor-pointer">
						<input type="checkbox" name="vertical_ids" value={v.id} class="accent-[--color-primary]"
							checked={editingItem?.associated_verticals.some((av) => av.id === v.id) ?? false} />
						{v.name}
					</label>
				{/each}
			</div>
		</div>

		<Input name="display_order" label="Display Order" type="number" value={String(editingItem?.display_order ?? 0)} />

		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button type="submit">{editingItem ? 'Save' : 'Create'}</Button>
		</div>
	</form>
</AdminModal>

<AdminModal open={deleteConfirmId !== null} title="Delete Content" onclose={() => (deleteConfirmId = null)}>
	<p class="text-sm text-[--color-text-muted] mb-4">Delete this content?</p>
	<form method="POST" action="?/delete" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); } await update(); }; }}>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
