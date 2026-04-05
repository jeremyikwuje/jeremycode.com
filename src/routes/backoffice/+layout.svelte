<script lang="ts">
	import '../../app.css';
	import { page } from '$app/state';
	import { AdminSidebar } from '$lib/components/backoffice/index.js';
	import type { LayoutData } from './$types.js';

	interface Props {
		data: LayoutData;
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	const isLoginPage = $derived((page.url.pathname as string) === '/backoffice/login');
</script>

{#if isLoginPage || !data.adminUser}
	<!-- Login page renders without the admin shell -->
	{@render children()}
{:else}
	<div class="flex min-h-screen bg-[--color-bg]">
		<AdminSidebar adminUser={data.adminUser} pendingSubmissions={data.pendingSubmissions} />

		<div class="flex-1 min-w-0 flex flex-col">
			<!-- Top bar -->
			<header
				class="h-14 shrink-0 flex items-center justify-between px-6 border-b border-[--color-border] bg-[--color-surface]"
			>
				<div></div>
				<a
					href="/"
					class="text-xs text-[--color-text-muted] hover:text-[--color-text] transition-colors"
					target="_blank"
					rel="noopener"
				>
					View site &rarr;
				</a>
			</header>

			<!-- Page content -->
			<main class="flex-1 overflow-y-auto p-6">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
