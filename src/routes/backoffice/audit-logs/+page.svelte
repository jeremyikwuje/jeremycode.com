<script lang="ts">
	import { goto } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const totalPages = $derived(Math.ceil(data.total / data.perPage));

	const entityTypes = ['vertical', 'attribute_definition', 'category', 'tool', 'expert', 'expert_take', 'submission', 'learn_content', 'admin_user', 'featured_tools'] as const;
	const actions = ['create', 'update', 'delete', 'publish', 'unpublish', 'activate', 'deactivate', 'feature', 'unfeature', 'reorder', 'approve', 'reject', 'request_changes'] as const;

	function setFilter(key: string, value: string) {
		const params = new URLSearchParams();
		const filters = { ...data.filters, [key]: value || undefined };
		if (filters.adminUserId) params.set('admin', filters.adminUserId);
		if (filters.entityType) params.set('entity', filters.entityType);
		if (filters.action) params.set('action', filters.action);
		const qs = params.toString();
		goto(`/backoffice/audit-logs${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function goToPage(pg: number) {
		const params = new URLSearchParams();
		if (data.filters.adminUserId) params.set('admin', data.filters.adminUserId);
		if (data.filters.entityType) params.set('entity', data.filters.entityType);
		if (data.filters.action) params.set('action', data.filters.action);
		if (pg > 1) params.set('page', String(pg));
		goto(`/backoffice/audit-logs?${params.toString()}`, { replaceState: true });
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
	}
</script>

<SeoHead title="Audit Logs" description="View audit logs" noindex />

<div class="max-w-6xl">
	<div class="mb-6">
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">Audit Logs</h1>
		<p class="mt-1 text-sm text-[--color-text-muted]">{data.total} entr{data.total === 1 ? 'y' : 'ies'}</p>
	</div>

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3 mb-4">
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);" value={data.filters.adminUserId ?? ''} onchange={(e) => setFilter('adminUserId', (e.target as HTMLSelectElement).value)}>
			<option value="">All Users</option>
			{#each data.users as u (u.id)}<option value={u.id}>{u.name}</option>{/each}
		</select>
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);" value={data.filters.entityType ?? ''} onchange={(e) => setFilter('entityType', (e.target as HTMLSelectElement).value)}>
			<option value="">All Entities</option>
			{#each entityTypes as et}<option value={et}>{et.replace(/_/g, ' ')}</option>{/each}
		</select>
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);" value={data.filters.action ?? ''} onchange={(e) => setFilter('action', (e.target as HTMLSelectElement).value)}>
			<option value="">All Actions</option>
			{#each actions as a}<option value={a}>{a.replace(/_/g, ' ')}</option>{/each}
		</select>
	</div>

	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">When</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">User</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Action</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Entity</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Target</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logs as log (log.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4 text-[--color-text-muted] text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
						<td class="py-3 px-4 text-[--color-text]">{log.admin_user_name}</td>
						<td class="py-3 px-4">
							<span class="text-xs font-medium text-[--color-primary]">{log.action}</span>
						</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs">{log.entity_type.replace(/_/g, ' ')}</td>
						<td class="py-3 px-4 text-[--color-text] text-xs">{log.entity_label}</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="py-12 text-center text-[--color-text-muted]">No audit log entries.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if totalPages > 1}
		<nav class="flex items-center justify-center gap-2 mt-6" aria-label="Pagination">
			<button type="button" onclick={() => goToPage(data.currentPage - 1)} disabled={data.currentPage <= 1}
				class="h-8 px-3 text-xs text-[--color-text-muted] bg-[--color-surface] border border-[--color-border] disabled:opacity-40 disabled:pointer-events-none"
				style="border-radius: var(--radius-button);">Previous</button>
			<span class="text-xs text-[--color-text-muted] px-2">Page {data.currentPage} of {totalPages}</span>
			<button type="button" onclick={() => goToPage(data.currentPage + 1)} disabled={data.currentPage >= totalPages}
				class="h-8 px-3 text-xs text-[--color-text-muted] bg-[--color-surface] border border-[--color-border] disabled:opacity-40 disabled:pointer-events-none"
				style="border-radius: var(--radius-button);">Next</button>
		</nav>
	{/if}
</div>
