<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let deleteConfirmId = $state<string | null>(null);
	let searchInput = $state(data.filters.search ?? '');

	const totalPages = $derived(Math.ceil(data.totalTools / data.perPage));
	const isSuperAdmin = $derived(
		(page.data as { adminUser?: { role: string } }).adminUser?.role === 'super_admin'
	);

	function applyFilters() {
		const params = new URLSearchParams();
		if (data.filters.verticalId) params.set('vertical', data.filters.verticalId);
		if (data.filters.status) params.set('status', data.filters.status);
		if (searchInput.trim()) params.set('search', searchInput.trim());
		const qs = params.toString();
		goto(`/backoffice/tools${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function setVertical(id: string) {
		data.filters.verticalId = id || undefined;
		applyFilters();
	}

	function setStatus(status: string) {
		data.filters.status = (status || undefined) as 'published' | 'draft' | undefined;
		applyFilters();
	}

	function goToPage(pg: number) {
		const params = new URLSearchParams(page.url.searchParams);
		if (pg > 1) params.set('page', String(pg));
		else params.delete('page');
		goto(`/backoffice/tools?${params.toString()}`, { replaceState: true });
	}
</script>

<SeoHead title="Tools" description="Manage tools" noindex />

<div class="max-w-6xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
				Tools
			</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">
				{data.totalTools} tool{data.totalTools === 1 ? '' : 's'}
			</p>
		</div>
		<Button href="/backoffice/tools/new">New Tool</Button>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">
			{form.error}
		</div>
	{/if}

	<!-- Filters bar -->
	<div class="flex flex-wrap items-center gap-3 mb-4">
		<input
			type="text"
			placeholder="Search tools..."
			bind:value={searchInput}
			onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') applyFilters(); }}
			class="h-9 w-48 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
		/>

		<select
			class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
			value={data.filters.verticalId ?? ''}
			onchange={(e) => setVertical((e.target as HTMLSelectElement).value)}
		>
			<option value="">All Verticals</option>
			{#each data.verticals as v (v.id)}
				<option value={v.id}>{v.name}</option>
			{/each}
		</select>

		<select
			class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
			value={data.filters.status ?? ''}
			onchange={(e) => setStatus((e.target as HTMLSelectElement).value)}
		>
			<option value="">All Statuses</option>
			<option value="published">Published</option>
			<option value="draft">Draft</option>
		</select>

		<Button variant="ghost" size="sm" onclick={applyFilters}>Search</Button>
	</div>

	<!-- Tools table -->
	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tool</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Vertical</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Category</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Status</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Takes</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.tools as tool (tool.id)}
					{@const accent = tool.vertical.accent_colour ?? 'var(--color-primary)'}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4">
							<div class="flex items-center gap-3">
								{#if tool.logo_url}
									<img src={tool.logo_url} alt="" width="24" height="24" class="shrink-0 object-contain" style="border-radius: var(--radius-badge);" />
								{:else}
									<span class="w-6 h-6 flex items-center justify-center shrink-0 bg-[--color-surface-alt] text-[--color-text-muted] text-[10px] font-bold" style="border-radius: var(--radius-badge);">
										{tool.name.charAt(0)}
									</span>
								{/if}
								<div class="min-w-0">
									<a href="/backoffice/tools/{tool.id}/edit" class="font-medium text-[--color-text] hover:text-[--color-primary] transition-colors">
										{tool.name}
									</a>
									<p class="text-xs text-[--color-text-muted] truncate max-w-60">{tool.tagline}</p>
								</div>
							</div>
						</td>
						<td class="py-3 px-4">
							<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium"
								style="border-radius: var(--radius-badge); background-color: color-mix(in srgb, {accent} 20%, transparent); color: {accent};">
								{tool.vertical.name}
							</span>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs">{tool.category.name}</td>
						<td class="py-3 px-4 text-center">
							<form method="POST" action="?/togglePublish" use:enhance={() => {
								return async ({ update }) => { await update(); invalidateAll(); };
							}}>
								<input type="hidden" name="id" value={tool.id} />
								<input type="hidden" name="is_published" value={!tool.is_published} />
								<button type="submit" class="inline-flex">
									<Badge variant={tool.is_published ? 'api' : 'region'}>
										{tool.is_published ? 'Published' : 'Draft'}
									</Badge>
								</button>
							</form>
						</td>
						<td class="py-3 px-4 text-right text-[--color-text] tabular-nums">{tool.expert_takes.length}</td>
						<td class="py-3 px-4 text-right">
							<div class="flex items-center justify-end gap-2">
								<a href="/backoffice/tools/{tool.id}/edit" class="text-xs text-[--color-secondary] hover:underline">Edit</a>
								{#if isSuperAdmin}
									<button onclick={() => (deleteConfirmId = tool.id)} class="text-xs text-red-400 hover:underline">Delete</button>
								{/if}
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="6" class="py-12 text-center text-[--color-text-muted]">
							No tools found. <a href="/backoffice/tools/new" class="text-[--color-primary] hover:underline">Create one</a>.
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<nav class="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
			<button type="button" onclick={() => goToPage(data.currentPage - 1)} disabled={data.currentPage <= 1}
				class="h-8 px-3 text-xs text-[--color-text-muted] bg-[--color-surface] border border-[--color-border] disabled:opacity-40 disabled:pointer-events-none"
				style="border-radius: var(--radius-button);">
				Previous
			</button>
			<span class="text-xs text-[--color-text-muted] px-2">Page {data.currentPage} of {totalPages}</span>
			<button type="button" onclick={() => goToPage(data.currentPage + 1)} disabled={data.currentPage >= totalPages}
				class="h-8 px-3 text-xs text-[--color-text-muted] bg-[--color-surface] border border-[--color-border] disabled:opacity-40 disabled:pointer-events-none"
				style="border-radius: var(--radius-button);">
				Next
			</button>
		</nav>
	{/if}
</div>

<!-- Delete Confirmation -->
<AdminModal open={deleteConfirmId !== null} title="Delete Tool" onclose={() => (deleteConfirmId = null)}>
	<p class="text-sm text-[--color-text-muted] mb-4">
		Are you sure you want to permanently delete this tool? This cannot be undone.
	</p>
	<form method="POST" action="?/delete" use:enhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'success') { deleteConfirmId = null; invalidateAll(); }
			await update();
		};
	}}>
		<input type="hidden" name="id" value={deleteConfirmId ?? ''} />
		<div class="flex justify-end gap-3">
			<Button type="button" variant="ghost" onclick={() => (deleteConfirmId = null)}>Cancel</Button>
			<Button type="submit" variant="destructive">Delete</Button>
		</div>
	</form>
</AdminModal>
