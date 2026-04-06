<script lang="ts">
	import '../app.css';
	import { uiStore, verticalStore } from '$lib/stores/index.js';
	import GlobalNav from '$lib/components/layout/GlobalNav.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import CommandPalette from '$lib/components/search/CommandPalette.svelte';
	import type { LayoutData } from './$types.js';

	interface Props {
		data: LayoutData;
		children: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();

	// Populate vertical store from server data so all components can read it
	// without prop-drilling. Runs whenever data.verticals changes (e.g. nav).
	$effect(() => {
		verticalStore.set(data.verticals);
	});

	// Global CMD+K keyboard shortcut
	function handleKeydown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			uiStore.openSearchPalette();
		}
	}

	// Close mobile menu on navigation (page changes)
	$effect(() => {
		uiStore.closeMobileMenu();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<!-- Sitemap discovery for crawlers -->
	<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
</svelte:head>

<a href="#main-content" class="skip-to-main">Skip to main content</a>

<div class="flex flex-col min-h-screen">
	<GlobalNav verticals={data.verticals} />

	<!--
		pt-16 offsets the fixed nav height (h-16).
		Pages that want full-bleed hero sections can use negative margin tricks.
	-->
	<main id="main-content" class="flex-1 pt-16" tabindex="-1">
		{@render children()}
	</main>

	<Footer verticals={data.verticals} />
</div>

<!-- CommandPalette is always mounted at root so CMD+K works on every page -->
<CommandPalette />
