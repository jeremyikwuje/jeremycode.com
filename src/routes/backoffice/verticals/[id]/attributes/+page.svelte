<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { AttributeDefinition, AttributeValueType } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modalOpen = $state(false);
	let editingAttr = $state<AttributeDefinition | null>(null);
	let deleteConfirmId = $state<string | null>(null);

	// Form state for value_type to conditionally show allowed_values
	let selectedValueType = $state<AttributeValueType>('text');

	const showAllowedValues = $derived(
		selectedValueType === 'multi_select' || selectedValueType === 'single_select'
	);

	function openCreate() {
		editingAttr = null;
		selectedValueType = 'text';
		modalOpen = true;
	}

	function openEdit(attr: AttributeDefinition) {
		editingAttr = attr;
		selectedValueType = attr.value_type;
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		editingAttr = null;
	}

	const valueTypeLabels: Record<AttributeValueType, string> = {
		multi_select: 'Multi Select',
		single_select: 'Single Select',
		boolean: 'Boolean',
		text: 'Text'
	};

	function keyify(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
	}

	let displayNameInput = $state('');
	let autoKey = $derived(editingAttr ? editingAttr.key : keyify(displayNameInput));
</script>

<SeoHead title="Attributes — {data.vertical.name}" description="Manage attribute definitions" noindex />

<div class="max-w-5xl">
	<!-- Breadcrumb -->
	<nav class="text-sm text-[--color-text-muted] mb-4">
		<a href="/backoffice/verticals" class="hover:text-[--color-text] transition-colors">Verticals</a>
		<span class="mx-1.5">/</span>
		<span class="text-[--color-text]">{data.vertical.name}</span>
		<span class="mx-1.5">/</span>
		<span class="text-[--color-text]">Attributes</span>
	</nav>

	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
				Attribute Definitions
			</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">
				{data.vertical.name} — {data.attributes.length} attribute{data.attributes.length === 1 ? '' : 's'}
			</p>
		</div>
		<Button onclick={openCreate}>New Attribute</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">
			{form.error}
		</div>
	{/if}

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Display Name</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Key</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Type</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Values</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Filterable</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.attributes as attr (attr.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4 font-medium text-[--color-text]">{attr.display_name}</td>
						<td class="py-3 px-4 text-[--color-text-muted] font-mono text-xs">{attr.key}</td>
						<td class="py-3 px-4">
							<Badge>{valueTypeLabels[attr.value_type]}</Badge>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs max-w-48 truncate">
							{#if attr.allowed_values.length > 0}
								{attr.allowed_values.join(', ')}
							{:else}
								<span class="text-[--color-text-muted]">—</span>
							{/if}
						</td>
						<td class="py-3 px-4 text-center">
							{#if attr.filterable}
								<span class="text-green-400">Yes</span>
							{:else}
								<span class="text-[--color-text-muted]">No</span>
							{/if}
						</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<button onclick={() => openEdit(attr)} class="text-xs text-[--color-secondary] hover:underline">Edit</button>
								<button onclick={() => (deleteConfirmId = attr.id)} class="text-xs text-red-400 hover:underline">Delete</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="py-12 text-center text-[--color-text-muted]">
							No attribute definitions yet. Create one to add filterable properties to {data.vertical.name} tools.
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
	title={editingAttr ? `Edit ${editingAttr.display_name}` : 'New Attribute'}
	onclose={closeModal}
>
	<form
		method="POST"
		action={editingAttr ? '?/update' : '?/create'}
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success') { closeModal(); invalidateAll(); }
				await update();
			};
		}}
		class="flex flex-col gap-4"
	>
		{#if editingAttr}
			<input type="hidden" name="attr_id" value={editingAttr.id} />
		{/if}

		<Input
			name="display_name"
			label="Display Name *"
			placeholder="e.g. Supported Chains"
			value={editingAttr?.display_name ?? ''}
			required
			oninput={(e: Event) => { displayNameInput = (e.target as HTMLInputElement).value; }}
		/>

		<Input
			name="key"
			label="Key *"
			placeholder="e.g. chains"
			value={editingAttr?.key ?? autoKey}
			required
			hint="Machine-readable key. Auto-generated from display name."
		/>

		<div class="flex flex-col gap-1.5">
			<label for="attr-value-type" class="text-sm font-medium text-[--color-text]">Value Type *</label>
			<select
				id="attr-value-type"
				name="value_type"
				class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary] transition-colors"
				style="border-radius: var(--radius-button);"
				value={selectedValueType}
				onchange={(e) => { selectedValueType = (e.target as HTMLSelectElement).value as AttributeValueType; }}
			>
				{#each Object.entries(valueTypeLabels) as [value, label]}
					<option {value}>{label}</option>
				{/each}
			</select>
		</div>

		{#if showAllowedValues}
			<Input
				name="allowed_values"
				label="Allowed Values"
				placeholder="Ethereum, Solana, Base, Polygon"
				value={editingAttr?.allowed_values.join(', ') ?? ''}
				hint="Comma-separated list of allowed values."
			/>
		{/if}

		<Input
			name="display_order"
			label="Display Order"
			type="number"
			value={String(editingAttr?.display_order ?? 0)}
		/>

		<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
			<input type="checkbox" name="filterable" class="accent-[--color-primary]"
				checked={editingAttr?.filterable ?? true} />
			Filterable (show in frontend FilterPanel)
		</label>

		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={closeModal}>Cancel</Button>
			<Button type="submit">{editingAttr ? 'Save Changes' : 'Create Attribute'}</Button>
		</div>
	</form>
</AdminModal>

<!-- Delete Confirmation -->
<AdminModal
	open={deleteConfirmId !== null}
	title="Delete Attribute"
	onclose={() => (deleteConfirmId = null)}
>
	<p class="text-sm text-[--color-text-muted] mb-4">
		Are you sure? Deleting an attribute definition removes it from all tools in this vertical
		and from the frontend filter panel.
	</p>
	<form method="POST" action="?/delete" use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); }
			await update();
		};
	}}>
		<input type="hidden" name="attr_id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
