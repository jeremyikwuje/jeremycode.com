<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { ExpertTake } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingTake = $state<ExpertTake | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	function openCreate() { editingTake = null; modalOpen = true; }
	function openEdit(take: ExpertTake) { editingTake = take; modalOpen = true; }
	function closeModal() { modalOpen = false; editingTake = null; }

	function setFilter(key: string, value: string) {
		const params = new URLSearchParams();
		if (key === 'expert' && value) params.set('expert', value);
		else if (data.filters.expertId) params.set('expert', data.filters.expertId);
		if (key === 'vertical' && value) params.set('vertical', value);
		else if (data.filters.verticalId) params.set('vertical', data.filters.verticalId);
		if (key === 'expert' && !value) params.delete('expert');
		if (key === 'vertical' && !value) params.delete('vertical');
		const qs = params.toString();
		goto(`/backoffice/expert-takes${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	// Word count for content
	let contentValue = $state('');
	const wordCount = $derived(contentValue.trim() ? contentValue.trim().split(/\s+/).length : 0);
</script>

<SeoHead title="Expert Takes" description="Manage expert takes" noindex />

<div class="max-w-6xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Expert Takes</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">{data.total} take{data.total === 1 ? '' : 's'}</p>
		</div>
		<Button onclick={openCreate}>New Take</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3 mb-4">
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);" value={data.filters.expertId ?? ''} onchange={(e) => setFilter('expert', (e.target as HTMLSelectElement).value)}>
			<option value="">All Experts</option>
			{#each data.experts as e (e.id)}<option value={e.id}>{e.name}</option>{/each}
		</select>
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);" value={data.filters.verticalId ?? ''} onchange={(e) => setFilter('vertical', (e.target as HTMLSelectElement).value)}>
			<option value="">All Verticals</option>
			{#each data.verticals as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
		</select>
	</div>

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tool</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Expert</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Content</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Verified</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.takes as take (take.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4 font-medium text-[--color-text]">{data.tools.find((t) => t.id === take.tool_id)?.name ?? take.tool_id}</td>
						<td class="py-3 px-4 text-[--color-text-muted]">{take.expert.name}</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs max-w-64 truncate">{take.content}</td>
						<td class="py-3 px-4 text-center">
							{#if take.verified}<Badge variant="api">Verified</Badge>{:else}<span class="text-[--color-text-muted] text-xs">No</span>{/if}
						</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<button onclick={() => openEdit(take)} class="text-xs text-[--color-secondary] hover:underline">Edit</button>
								<button onclick={() => (deleteConfirmId = take.id)} class="text-xs text-red-400 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="py-12 text-center text-[--color-text-muted]">No expert takes yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Create / Edit Modal -->
<AdminModal open={modalOpen} title={editingTake ? 'Edit Take' : 'New Expert Take'} onclose={closeModal} width="max-w-xl">
	<form method="POST" action={editingTake ? '?/update' : '?/create'}
		use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { closeModal(); invalidateAll(); } await update(); }; }}
		class="flex flex-col gap-4">
		{#if editingTake}<input type="hidden" name="id" value={editingTake.id} />{/if}

		{#if !editingTake}
			<div class="flex flex-col gap-1.5">
				<label for="take-tool" class="text-sm font-medium text-[--color-text]">Tool *</label>
				<select id="take-tool" name="tool_id" class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
					style="border-radius: var(--radius-button);" required>
					<option value="" disabled selected>Select tool</option>
					{#each data.tools as t (t.id)}<option value={t.id}>{t.name}</option>{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="take-expert" class="text-sm font-medium text-[--color-text]">Expert *</label>
				<select id="take-expert" name="expert_id" class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
					style="border-radius: var(--radius-button);" required>
					<option value="" disabled selected>Select expert</option>
					{#each data.experts as e (e.id)}<option value={e.id}>{e.name}</option>{/each}
				</select>
			</div>
		{/if}

		<div class="flex flex-col gap-1.5">
			<label for="take-content" class="text-sm font-medium text-[--color-text]">Content * (100–150 words)</label>
			<textarea id="take-content" name="content" rows={5}
				class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors resize-y"
				style="border-radius: var(--radius-button);" required
				placeholder="Share your integration experience..."
				bind:value={contentValue}
			>{editingTake?.content ?? ''}</textarea>
			<p class="text-xs text-[--color-text-muted]">
				{wordCount} word{wordCount === 1 ? '' : 's'}
				{#if wordCount > 0 && wordCount < 100}<span class="text-yellow-400">— below minimum</span>{/if}
				{#if wordCount > 150}<span class="text-yellow-400">— above maximum</span>{/if}
			</p>
		</div>

		<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
			<input type="checkbox" name="verified" class="accent-[--color-primary]" checked={editingTake?.verified ?? false} />
			Verified (expert has personally integrated this tool)
		</label>

		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button type="submit">{editingTake ? 'Save' : 'Create'}</Button>
		</div>
	</form>
</AdminModal>

<AdminModal open={deleteConfirmId !== null} title="Delete Take" onclose={() => (deleteConfirmId = null)}>
	<p class="text-sm text-[--color-text-muted] mb-4">Delete this expert take?</p>
	<form method="POST" action="?/delete" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); } await update(); }; }}>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
