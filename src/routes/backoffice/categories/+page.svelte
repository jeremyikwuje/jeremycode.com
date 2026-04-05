<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { Category } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingCat = $state<Category | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	function openCreate() {
		editingCat = null;
		modalOpen = true;
	}

	function openEdit(cat: Category) {
		editingCat = cat;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editingCat = null;
	}

	function slugify(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	let nameInput = $state('');
	let autoSlug = $derived(editingCat ? editingCat.slug : slugify(nameInput));

	function switchVertical(id: string) {
		goto(`/backoffice/categories?vertical=${id}`, { replaceState: true });
	}
</script>

<SeoHead title="Categories" description="Manage categories" noindex />

<div class="max-w-5xl">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			Categories
		</h1>
		{#if data.selectedVertical}
			<Button onclick={openCreate}>New Category</Button>
		{/if}
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">
			{form.error}
		</div>
	{/if}

	<!-- Vertical selector -->
	<div class="flex items-center gap-2 mb-6">
		<label for="cat-vertical" class="text-sm font-medium text-[--color-text]">Vertical:</label>
		<select
			id="cat-vertical"
			class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
			value={data.selectedVertical?.id ?? ''}
			onchange={(e) => switchVertical((e.target as HTMLSelectElement).value)}
		>
			{#each data.verticals as v (v.id)}
				<option value={v.id}>{v.name}</option>
			{/each}
		</select>
	</div>

	{#if data.selectedVertical}
		<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[--color-border]">
						<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Name</th>
						<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Slug</th>
						<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tools</th>
						<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Order</th>
						<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.categories as cat (cat.id)}
						<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
							<td class="py-3 px-4">
								<div class="flex items-center gap-2">
									{#if cat.color_code}
										<span class="w-3 h-3 shrink-0" style="background-color: {cat.color_code}; border-radius: 2px;" aria-hidden="true"></span>
									{/if}
									<span class="font-medium text-[--color-text]">{cat.name}</span>
								</div>
							</td>
							<td class="py-3 px-4 text-[--color-text-muted] font-mono text-xs">{cat.slug}</td>
							<td class="py-3 px-4 text-right text-[--color-text] tabular-nums">{cat.tool_count ?? 0}</td>
							<td class="py-3 px-4 text-right text-[--color-text-muted] tabular-nums">{cat.display_order}</td>
							<td class="py-3 px-4 text-right">
								<div class="flex items-center justify-end gap-2">
									<button onclick={() => openEdit(cat)} class="text-xs text-[--color-secondary] hover:underline">Edit</button>
									<button onclick={() => (deleteConfirmId = cat.id)} class="text-xs text-red-400 hover:underline">Delete</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="py-12 text-center text-[--color-text-muted]">
								No categories for {data.selectedVertical.name}. Create one.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Create / Edit Modal -->
{#if data.selectedVertical}
	<AdminModal
		open={modalOpen}
		title={editingCat ? `Edit ${editingCat.name}` : 'New Category'}
		onclose={closeModal}
	>
		<form
			method="POST"
			action={editingCat ? '?/update' : '?/create'}
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') { closeModal(); invalidateAll(); }
					await update();
				};
			}}
			class="flex flex-col gap-4"
		>
			<input type="hidden" name="vertical_id" value={data.selectedVertical.id} />
			{#if editingCat}
				<input type="hidden" name="category_id" value={editingCat.id} />
			{/if}

			<Input
				name="name"
				label="Name *"
				placeholder="e.g. On/Off Ramps"
				value={editingCat?.name ?? ''}
				required
				oninput={(e: Event) => { nameInput = (e.target as HTMLInputElement).value; }}
			/>

			<Input
				name="slug"
				label="Slug *"
				placeholder="e.g. on-off-ramps"
				value={editingCat?.slug ?? autoSlug}
				required
			/>

			<div class="flex flex-col gap-1.5">
				<label for="cat-desc" class="text-sm font-medium text-[--color-text]">Description</label>
				<textarea
					id="cat-desc"
					name="description"
					rows={2}
					placeholder="Optional description"
					class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors resize-y"
					style="border-radius: var(--radius-button);"
				>{editingCat?.description ?? ''}</textarea>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Input
					name="colour"
					label="Colour"
					type="color"
					value={editingCat?.colour ?? '#4F8EF7'}
				/>
				<Input
					name="display_order"
					label="Display Order"
					type="number"
					value={String(editingCat?.display_order ?? 0)}
				/>
			</div>

			<div class="flex justify-end gap-3 pt-2">
				<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
				<Button type="submit">{editingCat ? 'Save Changes' : 'Create Category'}</Button>
			</div>
		</form>
	</AdminModal>

	<!-- Delete Confirmation -->
	<AdminModal
		open={deleteConfirmId !== null}
		title="Delete Category"
		onclose={() => (deleteConfirmId = null)}
	>
		<p class="text-sm text-[--color-text-muted] mb-4">
			Are you sure? Categories with assigned tools cannot be deleted.
		</p>
		<form method="POST" action="?/delete" use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); }
				await update();
			};
		}}>
			<input type="hidden" name="vertical_id" value={data.selectedVertical.id} />
			<input type="hidden" name="category_id" value={deleteConfirmId ?? ''} />
			<div class="flex justify-end gap-3">
				<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
				<Button type="submit" variant="destructive">Delete</Button>
			</div>
		</form>
	</AdminModal>
{/if}
