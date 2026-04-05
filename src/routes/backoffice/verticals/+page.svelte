<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Vertical } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingVertical = $state<Vertical | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	function openCreate() {
		editingVertical = null;
		modalOpen = true;
	}

	function openEdit(v: Vertical) {
		editingVertical = v;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editingVertical = null;
	}

	function slugify(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	let nameInput = $state('');
	let autoSlug = $derived(editingVertical ? editingVertical.slug : slugify(nameInput));
</script>

<SeoHead title="Verticals" description="Manage verticals" noindex />

<div class="max-w-5xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			Verticals
		</h1>
		<Button onclick={openCreate}>New Vertical</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">
			{form.error}
		</div>
	{/if}

	<!-- Verticals table -->
	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Vertical</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Slug</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Status</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tools</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Cats</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Attrs</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.verticals as v (v.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4">
							<div class="flex items-center gap-2">
								{#if v.icon}
									<span class="text-base">{v.icon}</span>
								{/if}
								<span class="font-medium text-[--color-text]">{v.name}</span>
								{#if v.accent_colour}
									<span class="w-3 h-3 shrink-0" style="background-color: {v.accent_colour}; border-radius: 2px;" aria-hidden="true"></span>
								{/if}
							</div>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted] font-mono text-xs">{v.slug}</td>
						<td class="py-3 px-4 text-center">
							<form method="POST" action="?/toggleActive" use:enhance={() => {
								return async ({ update }) => { await update(); invalidateAll(); };
							}}>
								<input type="hidden" name="id" value={v.id} />
								<input type="hidden" name="is_active" value={!v.is_active} />
								<button type="submit" class="inline-flex">
									<Badge variant={v.is_active ? 'api' : 'region'}>
										{v.is_active ? 'Active' : 'Inactive'}
									</Badge>
								</button>
							</form>
						</td>
						<td class="py-3 px-4 text-right text-[--color-text] tabular-nums">{v.tool_count ?? 0}</td>
						<td class="py-3 px-4 text-right text-[--color-text] tabular-nums">{v.categories.length}</td>
						<td class="py-3 px-4 text-right text-[--color-text] tabular-nums">{v.attribute_definitions.length}</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<button onclick={() => openEdit(v)} class="text-xs text-[--color-secondary] hover:underline">
									Edit
								</button>
								<a href="/backoffice/verticals/{v.id}/attributes" class="text-xs text-[--color-text-muted] hover:text-[--color-text]">
									Attrs
								</a>
								<button onclick={() => (deleteConfirmId = v.id)} class="text-xs text-red-400 hover:underline">
									Delete
								</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="7" class="py-12 text-center text-[--color-text-muted]">
							No verticals yet. Create your first one.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Create / Edit Modal -->
<AdminModal
	open={modalOpen}
	title={editingVertical ? `Edit ${editingVertical.name}` : 'New Vertical'}
	onclose={closeModal}
>
	<form
		method="POST"
		action={editingVertical ? '?/update' : '?/create'}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					closeModal();
					invalidateAll();
				}
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		{#if editingVertical}
			<input type="hidden" name="id" value={editingVertical.id} />
		{/if}

		<Input
			name="name"
			label="Name *"
			placeholder="e.g. Stablecoins"
			value={editingVertical?.name ?? ''}
			required
			oninput={(e: Event) => { nameInput = (e.target as HTMLInputElement).value; }}
		/>

		<Input
			name="slug"
			label="Slug *"
			placeholder="e.g. stablecoins"
			value={editingVertical?.slug ?? autoSlug}
			required
		/>

		<div class="flex flex-col gap-1.5">
			<label for="v-description" class="text-sm font-medium text-[--color-text]">Description *</label>
			<textarea
				id="v-description"
				name="description"
				rows={3}
				placeholder="What does this vertical cover?"
				class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors resize-y"
				style="border-radius: var(--radius-button);"
				required
			>{editingVertical?.description ?? ''}</textarea>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<Input
				name="icon"
				label="Icon (emoji)"
				placeholder="e.g. 💰"
				value={editingVertical?.icon ?? ''}
			/>

			<Input
				name="accent_colour"
				label="Accent Colour"
				type="color"
				value={editingVertical?.accent_colour ?? '#A259FF'}
			/>
		</div>

		<Input
			name="display_order"
			label="Display Order"
			type="number"
			value={String(editingVertical?.display_order ?? 0)}
		/>

		<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
			<input type="checkbox" name="is_active" class="accent-[--color-primary]"
				checked={editingVertical?.is_active ?? true} />
			Active
		</label>

		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button type="submit">{editingVertical ? 'Save Changes' : 'Create Vertical'}</Button>
		</div>
	</form>
</AdminModal>

<!-- Delete Confirmation Modal -->
<AdminModal
	open={deleteConfirmId !== null}
	title="Delete Vertical"
	onclose={() => (deleteConfirmId = null)}
>
	<p class="text-sm text-[--color-text-muted] mb-4">
		Are you sure you want to delete this vertical? This action cannot be undone.
		Verticals with assigned tools cannot be deleted.
	</p>
	<form
		method="POST"
		action="?/delete"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') {
					deleteConfirmId = null;
					invalidateAll();
				}
				await update();
			};
		}}
	>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
