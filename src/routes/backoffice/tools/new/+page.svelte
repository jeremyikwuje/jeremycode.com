<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolForm from '$lib/components/backoffice/ToolForm.svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<SeoHead title="New Tool" description="Create a new tool" noindex />

<div>
	<div class="mb-6">
		<nav class="text-sm text-[--color-text-muted] mb-3">
			<a href="/backoffice/tools" class="hover:text-[--color-text] transition-colors">Tools</a>
			<span class="mx-1.5">/</span>
			<span class="text-[--color-text]">New</span>
		</nav>
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			New Tool
		</h1>
	</div>

	<ToolForm
		verticals={data.verticals}
		regions={data.regions}
		tool={null}
		action="?/default"
		formResult={form}
	/>
</div>
