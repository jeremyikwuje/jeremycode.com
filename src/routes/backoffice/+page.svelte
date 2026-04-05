<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const m = $derived(data.metrics);

	interface MetricCard {
		label: string;
		value: number | string;
		href?: string;
	}

	const cards = $derived<MetricCard[]>([
		{ label: 'Published Tools', value: m.total_published_tools, href: '/backoffice/tools' },
		{ label: 'Pending Submissions', value: m.pending_submissions, href: '/backoffice/submissions' },
		{ label: 'Added This Month', value: m.tools_added_this_month },
		{
			label: 'Expert Take Coverage',
			value: `${Math.round(m.expert_take_coverage_rate * 100)}%`
		}
	]);
</script>

<SeoHead title="Dashboard" description="Admin dashboard" noindex />

<div class="max-w-6xl">
	<h1
		class="text-xl font-bold text-[--color-text] mb-6"
		style="font-family: var(--font-display);"
	>
		Dashboard
	</h1>

	<!-- Metric cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
		{#each cards as card (card.label)}
			{@const Tag = card.href ? 'a' : 'div'}
			<svelte:element
				this={Tag}
				href={card.href}
				class="p-5 bg-[--color-surface] border border-[--color-border] transition-colors
				       {card.href ? 'hover:border-[--color-primary]' : ''}"
				style="border-radius: var(--radius-card);"
			>
				<p class="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
					{card.label}
				</p>
				<p class="mt-2 text-2xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
					{card.value}
				</p>
			</svelte:element>
		{/each}
	</div>

	<!-- Tools by vertical breakdown -->
	{#if m.tools_by_vertical.length > 0}
		<section>
			<h2
				class="text-base font-semibold text-[--color-text] mb-4"
				style="font-family: var(--font-display);"
			>
				Tools by Vertical
			</h2>
			<div
				class="bg-[--color-surface] border border-[--color-border] overflow-hidden"
				style="border-radius: var(--radius-card);"
			>
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-[--color-border]">
							<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
								Vertical
							</th>
							<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
								Tools
							</th>
						</tr>
					</thead>
					<tbody>
						{#each m.tools_by_vertical as row (row.vertical_id)}
							<tr class="border-b border-[--color-border] last:border-0">
								<td class="py-3 px-4 text-[--color-text]">{row.vertical_name}</td>
								<td class="py-3 px-4 text-right text-[--color-text] font-medium tabular-nums">
									{row.count}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}
</div>
