<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Submission, SubmissionStatus } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let reviewingSub = $state<Submission | null>(null);
	let actionType = $state<SubmissionStatus | null>(null);
	let actionNotes = $state('');

	function openReview(sub: Submission) {
		reviewingSub = sub;
		actionType = null;
		actionNotes = '';
	}

	function closeReview() {
		reviewingSub = null;
		actionType = null;
		actionNotes = '';
	}

	function setFilter(key: string, value: string) {
		const params = new URLSearchParams();
		if (key === 'status' && value) params.set('status', value);
		else if (data.filters.status) params.set('status', data.filters.status);
		if (key === 'vertical' && value) params.set('vertical', value);
		else if (data.filters.verticalId) params.set('vertical', data.filters.verticalId);
		if (key === 'status' && !value) params.delete('status');
		if (key === 'vertical' && !value) params.delete('vertical');
		const qs = params.toString();
		goto(`/backoffice/submissions${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	const statusColors: Record<SubmissionStatus, string> = {
		pending: 'text-yellow-400',
		approved: 'text-green-400',
		rejected: 'text-red-400',
		changes_requested: 'text-blue-400'
	};

	const statusLabels: Record<SubmissionStatus, string> = {
		pending: 'Pending',
		approved: 'Approved',
		rejected: 'Rejected',
		changes_requested: 'Changes Requested'
	};

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}
</script>

<SeoHead title="Submissions" description="Review submissions" noindex />

<div class="max-w-6xl">
	<div class="flex items-center justify-between mb-6">
		<div>
			<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
				Submissions
			</h1>
			<p class="mt-1 text-sm text-[--color-text-muted]">{data.total} submission{data.total === 1 ? '' : 's'}</p>
		</div>
	</div>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3 mb-4">
		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
			value={data.filters.status ?? ''}
			onchange={(e) => setFilter('status', (e.target as HTMLSelectElement).value)}>
			<option value="">All Statuses</option>
			<option value="pending">Pending</option>
			<option value="approved">Approved</option>
			<option value="rejected">Rejected</option>
			<option value="changes_requested">Changes Requested</option>
		</select>

		<select class="h-9 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
			style="border-radius: var(--radius-button);"
			value={data.filters.verticalId ?? ''}
			onchange={(e) => setFilter('vertical', (e.target as HTMLSelectElement).value)}>
			<option value="">All Verticals</option>
			{#each data.verticals as v (v.id)}
				<option value={v.id}>{v.name}</option>
			{/each}
		</select>
	</div>

	<!-- Table -->
	<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-[--color-border]">
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Tool</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Submitter</th>
					<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Date</th>
					<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Status</th>
					<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.submissions as sub (sub.id)}
					<tr class="border-b border-[--color-border] last:border-0 hover:bg-[--color-surface-alt] transition-colors">
						<td class="py-3 px-4 font-medium text-[--color-text]">{sub.tool_name}</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs">{sub.submitter_email}</td>
						<td class="py-3 px-4 text-[--color-text-muted] text-xs">{formatDate(sub.created_at)}</td>
						<td class="py-3 px-4 text-center">
							<span class="text-xs font-medium {statusColors[sub.status]}">{statusLabels[sub.status]}</span>
						</td>
						<td class="py-3 px-4 text-right">
							<button onclick={() => openReview(sub)} class="text-xs text-[--color-secondary] hover:underline">Review</button>
						</td>
					</tr>
				{:else}
					<tr><td colspan="5" class="py-12 text-center text-[--color-text-muted]">No submissions found.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Review Modal (side-by-side) -->
<AdminModal
	open={reviewingSub !== null}
	title="Review: {reviewingSub?.tool_name ?? ''}"
	onclose={closeReview}
	width="max-w-4xl"
>
	{#if reviewingSub}
		<div class="flex flex-col lg:flex-row gap-6">
			<!-- Left: submitted data -->
			<div class="flex-1 min-w-0">
				<h3 class="text-sm font-semibold text-[--color-text] mb-3">Submitted Data</h3>
				<dl class="space-y-2 text-sm">
					<div>
						<dt class="text-xs text-[--color-text-muted] uppercase tracking-wider">Tool Name</dt>
						<dd class="text-[--color-text] mt-0.5">{reviewingSub.tool_name}</dd>
					</div>
					<div>
						<dt class="text-xs text-[--color-text-muted] uppercase tracking-wider">Submitter</dt>
						<dd class="text-[--color-text] mt-0.5">{reviewingSub.submitter_email}</dd>
					</div>
					<div>
						<dt class="text-xs text-[--color-text-muted] uppercase tracking-wider">Submitted</dt>
						<dd class="text-[--color-text] mt-0.5">{formatDate(reviewingSub.created_at)}</dd>
					</div>
					{#each Object.entries(reviewingSub.submitted_data) as [key, value]}
						<div>
							<dt class="text-xs text-[--color-text-muted] uppercase tracking-wider">{key.replace(/_/g, ' ')}</dt>
							<dd class="text-[--color-text] mt-0.5 break-words">
								{#if Array.isArray(value)}
									{value.join(', ')}
								{:else if typeof value === 'boolean'}
									{value ? 'Yes' : 'No'}
								{:else}
									{String(value ?? '—')}
								{/if}
							</dd>
						</div>
					{/each}
					{#if reviewingSub.review_notes}
						<div class="pt-2 border-t border-[--color-border]">
							<dt class="text-xs text-[--color-text-muted] uppercase tracking-wider">Previous Notes</dt>
							<dd class="text-[--color-text] mt-0.5 whitespace-pre-line">{reviewingSub.review_notes}</dd>
						</div>
					{/if}
				</dl>
			</div>

			<!-- Right: actions -->
			<div class="lg:w-64 shrink-0 lg:border-l lg:border-[--color-border] lg:pl-6">
				<h3 class="text-sm font-semibold text-[--color-text] mb-3">Actions</h3>
				<p class="text-xs text-[--color-text-muted] mb-1">
					Current status: <span class="{statusColors[reviewingSub.status]} font-medium">{statusLabels[reviewingSub.status]}</span>
				</p>

				<div class="flex flex-col gap-2 mt-4">
					<button type="button" onclick={() => { actionType = 'approved'; }}
						class="text-left px-3 py-2 text-sm text-green-400 bg-[--color-surface-alt] border border-[--color-border] hover:border-green-400 transition-colors {actionType === 'approved' ? 'border-green-400' : ''}"
						style="border-radius: var(--radius-button);">
						Approve
					</button>
					<button type="button" onclick={() => { actionType = 'rejected'; }}
						class="text-left px-3 py-2 text-sm text-red-400 bg-[--color-surface-alt] border border-[--color-border] hover:border-red-400 transition-colors {actionType === 'rejected' ? 'border-red-400' : ''}"
						style="border-radius: var(--radius-button);">
						Reject
					</button>
					<button type="button" onclick={() => { actionType = 'changes_requested'; }}
						class="text-left px-3 py-2 text-sm text-blue-400 bg-[--color-surface-alt] border border-[--color-border] hover:border-blue-400 transition-colors {actionType === 'changes_requested' ? 'border-blue-400' : ''}"
						style="border-radius: var(--radius-button);">
						Request Changes
					</button>
				</div>

				{#if actionType}
					<form method="POST" action="?/updateStatus" use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') { closeReview(); invalidateAll(); }
							await update();
						};
					}} class="mt-4 space-y-3">
						<input type="hidden" name="id" value={reviewingSub.id} />
						<input type="hidden" name="status" value={actionType} />

						{#if actionType === 'rejected' || actionType === 'changes_requested'}
							<div class="flex flex-col gap-1.5">
								<label for="review-notes" class="text-xs font-medium text-[--color-text]">
									{actionType === 'rejected' ? 'Rejection reason' : 'Notes for submitter'}
								</label>
								<textarea
									id="review-notes"
									name="notes"
									rows={3}
									bind:value={actionNotes}
									class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] resize-y"
									style="border-radius: var(--radius-button);"
									placeholder="Explain why..."
								></textarea>
							</div>
						{/if}

						<Button type="submit" size="sm">
							Confirm {actionType === 'approved' ? 'Approval' : actionType === 'rejected' ? 'Rejection' : 'Request'}
						</Button>
					</form>
				{/if}
			</div>
		</div>
	{/if}
</AdminModal>
