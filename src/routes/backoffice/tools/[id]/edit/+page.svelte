<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import ToolForm from '$lib/components/backoffice/ToolForm.svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<SeoHead title="Edit {data.tool.name}" description="Edit tool" noindex />

<div>
	<div class="mb-6">
		<nav class="text-sm text-[--color-text-muted] mb-3">
			<a href="/backoffice/tools" class="hover:text-[--color-text] transition-colors">Tools</a>
			<span class="mx-1.5">/</span>
			<span class="text-[--color-text]">{data.tool.name}</span>
		</nav>
		<h1 class="text-xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
			Edit {data.tool.name}
		</h1>
		{#if form?.success}
			<p class="mt-2 text-sm text-green-400">Changes saved.</p>
		{/if}
	</div>

	<ToolForm
		verticals={data.verticals}
		regions={data.regions}
		tool={data.tool}
		action="?/default"
		formResult={form}
	/>
</div>
