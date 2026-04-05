<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { Expert } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingExpert = $state<Expert | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	function openCreate() { editingExpert = null; modalOpen = true; }
	function openEdit(e: Expert) { editingExpert = e; modalOpen = true; }
	function closeModal() { modalOpen = false; editingExpert = null; }

	function slugify(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	let nameInput = $state('');
	let autoSlug = $derived(editingExpert ? editingExpert.slug : slugify(nameInput));
</script>

<SeoHead title="Experts" description="Manage expert profiles" noindex />

<div class="max-w-4xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Experts</h1>
		<Button onclick={openCreate}>New Expert</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Expert</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Title</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Slug</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.experts as expert (expert.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4">
							<div class="flex items-center gap-3">
								{#if expert.avatar_url}
									<img src={expert.avatar_url} alt="" width="28" height="28" class="shrink-0 object-cover" style="border-radius: 50%;" />
								{:else}
									<span class="w-7 h-7 flex items-center justify-center shrink-0 bg-[--color-surface-alt] text-[--color-text-muted] text-xs font-bold" style="border-radius: 50%;">{expert.name.charAt(0)}</span>
								{/if}
								<span class="font-medium text-[--color-text]">{expert.name}</span>
							</div>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted]">{expert.title}</td>
						<td class="py-3 px-4 text-[--color-text-muted] font-mono text-xs">{expert.slug}</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<button onclick={() => openEdit(expert)} class="text-xs text-[--color-secondary] hover:underline">Edit</button>
								<button onclick={() => (deleteConfirmId = expert.id)} class="text-xs text-red-400 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr><td colspan="4" class="py-12 text-center text-[--color-text-muted]">No experts yet. Create Jeremy as the default expert.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<AdminModal open={modalOpen} title={editingExpert ? `Edit ${editingExpert.name}` : 'New Expert'} onclose={closeModal}>
	<form method="POST" action={editingExpert ? '?/update' : '?/create'}
		use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { closeModal(); invalidateAll(); } await update(); }; }}
		class="flex flex-col gap-4">
		{#if editingExpert}<input type="hidden" name="id" value={editingExpert.id} />{/if}
		<Input name="name" label="Name *" placeholder="Jeremy" value={editingExpert?.name ?? ''} required
			oninput={(e: Event) => { nameInput = (e.target as HTMLInputElement).value; }} />
		<Input name="slug" label="Slug *" placeholder="jeremy" value={editingExpert?.slug ?? autoSlug} required />
		<Input name="title" label="Title *" placeholder="Fintech Engineer" value={editingExpert?.title ?? ''} required />
		<div class="flex flex-col gap-1.5">
			<label for="expert-bio" class="text-sm font-medium text-[--color-text]">Bio</label>
			<textarea id="expert-bio" name="bio" rows={3} placeholder="Short bio..." class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors resize-y" style="border-radius: var(--radius-button);">{editingExpert?.bio ?? ''}</textarea>
		</div>
		<Input name="avatar_url" label="Avatar URL" type="url" placeholder="https://..." value={editingExpert?.avatar_url ?? ''} />
		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button type="submit">{editingExpert ? 'Save' : 'Create'}</Button>
		</div>
	</form>
</AdminModal>

<AdminModal open={deleteConfirmId !== null} title="Delete Expert" onclose={() => (deleteConfirmId = null)}>
	<p class="text-sm text-[--color-text-muted] mb-4">Delete this expert? Their takes will also be removed.</p>
	<form method="POST" action="?/delete" use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); } await update(); }; }}>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
