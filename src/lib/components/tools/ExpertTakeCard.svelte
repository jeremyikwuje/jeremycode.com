<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { ExpertTake } from '$lib/types/index.js';

	interface Props {
		take: ExpertTake;
		class?: string;
	}

	let { take, class: extraClass = '' }: Props = $props();

	const expert = $derived(take.expert);

	function expertInitial(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<Card variant="elevated" class="p-5 {extraClass}">
	<article>
		<!-- Expert header -->
		<div class="flex items-center gap-3">
			{#if expert.avatar_url}
				<img
					src={expert.avatar_url}
					alt="{expert.name}'s avatar"
					width="36"
					height="36"
					class="shrink-0 rounded-full object-cover"
				/>
			{:else}
				<span
					class="shrink-0 w-9 h-9 flex items-center justify-center rounded-full
					       bg-[--color-surface] text-[--color-text-muted] text-sm font-bold"
					aria-hidden="true"
				>
					{expertInitial(expert.name)}
				</span>
			{/if}

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<span class="text-sm font-semibold text-[--color-text] truncate">
						{expert.name}
					</span>
					{#if take.verified}
						<Badge variant="verified">
							<!-- Checkmark icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
							Verified
						</Badge>
					{/if}
				</div>
				<p class="text-xs text-[--color-text-muted] truncate">{expert.title}</p>
			</div>

			<time
				datetime={take.published_at}
				class="shrink-0 text-xs text-[--color-text-muted] hidden sm:block"
			>
				{formatDate(take.published_at)}
			</time>
		</div>

		<!-- Content (Markdown rendered as plain text for now; Phase 2+ adds prose rendering) -->
		<div class="mt-4 text-sm text-[--color-text] leading-relaxed whitespace-pre-line">
			{take.content}
		</div>
	</article>
</Card>
