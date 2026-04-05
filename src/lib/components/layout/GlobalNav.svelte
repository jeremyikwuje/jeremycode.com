<script lang="ts">
	import { page } from '$app/state';
	import { uiStore } from '$lib/stores/index.js';
	import SearchInput from '$lib/components/search/SearchInput.svelte';
	import type { Vertical } from '$lib/types/index.js';

	interface Props {
		verticals: Vertical[];
	}

	let { verticals }: Props = $props();

	const activeVerticals = $derived(verticals.filter((v) => v.is_active));

	// Cast to string: SvelteKit typed routes narrow pathname to a union
	// of known route strings, which breaks equality checks against dynamic values.
	const pathname = $derived(page.url.pathname as string);

	function isVerticalActive(vertical: Vertical): boolean {
		return pathname === `/${vertical.slug}` || pathname.startsWith(`/${vertical.slug}/`);
	}

	const isToolsActive = $derived(
		pathname === '/tools' || pathname.startsWith('/tools/')
	);
</script>

<header
	class="fixed top-0 inset-x-0 z-40 h-16 border-b border-[--color-border]
	       bg-[--color-bg]/90 backdrop-blur-md"
>
	<nav
		class="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4"
		aria-label="Main navigation"
	>
		<!-- Logo -->
		<a
			href="/"
			class="shrink-0 text-[--color-text] font-bold text-lg tracking-tight hover:text-[--color-primary] transition-colors"
			style="font-family: var(--font-display);"
			aria-label="Jeremy Code — home"
		>
			Jeremy Code
		</a>

		<!-- Vertical tabs — desktop -->
		<ul class="hidden md:flex items-center gap-1 flex-1 overflow-x-auto list-none m-0 p-0">
			<!-- "All Tools" always first -->
			<li class="shrink-0">
				<a
					href="/tools"
					class="relative flex items-center px-3 py-1.5 text-sm font-medium transition-colors
					       {isToolsActive
						? 'text-[--color-text]'
						: 'text-[--color-text-muted] hover:text-[--color-text]'}"
					aria-current={isToolsActive ? 'page' : undefined}
				>
					All Tools
					{#if isToolsActive}
						<span
							class="absolute bottom-0 inset-x-3 h-0.5 bg-[--color-primary]"
							style="border-radius: 1px;"
						></span>
					{/if}
				</a>
			</li>

			{#each activeVerticals as vertical (vertical.id)}
				{@const active = isVerticalActive(vertical)}
				{@const accentColor = vertical.accent_colour ?? 'var(--color-primary)'}
				<li class="shrink-0">
					<a
						href="/{vertical.slug}"
						class="relative flex items-center px-3 py-1.5 text-sm font-medium transition-colors
						       {active
							? 'text-[--color-text]'
							: 'text-[--color-text-muted] hover:text-[--color-text]'}"
						aria-current={active ? 'page' : undefined}
					>
						{vertical.name}
						{#if active}
							<span
								class="absolute bottom-0 inset-x-3 h-0.5"
								style="background-color: {accentColor}; border-radius: 1px;"
							></span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Spacer (mobile: pushes search and hamburger to the right) -->
		<div class="flex-1 md:hidden"></div>

		<!-- CMD+K trigger — desktop -->
		<SearchInput class="shrink-0" />

		<!-- Hamburger — mobile only -->
		<button
			type="button"
			onclick={() => uiStore.toggleMobileMenu()}
			aria-label={uiStore.mobileMenuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={uiStore.mobileMenuOpen}
			aria-controls="mobile-menu"
			class="md:hidden flex items-center justify-center w-9 h-9
			       text-[--color-text-muted] hover:text-[--color-text] transition-colors"
		>
			{#if uiStore.mobileMenuOpen}
				<!-- X icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			{:else}
				<!-- Hamburger icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			{/if}
		</button>
	</nav>

	<!-- Mobile menu -->
	{#if uiStore.mobileMenuOpen}
		<div
			id="mobile-menu"
			class="md:hidden border-t border-[--color-border] bg-[--color-bg]
			       px-4 py-4 flex flex-col gap-1"
		>
			<!-- Search — full width on mobile -->
			<button
				type="button"
				onclick={() => {
					uiStore.closeMobileMenu();
					uiStore.openSearchPalette();
				}}
				class="flex items-center gap-2 w-full h-10 px-3 mb-2 text-sm text-left
				       text-[--color-text-muted] bg-[--color-surface] border border-[--color-border]
				       hover:border-[--color-primary] transition-colors"
				style="border-radius: var(--radius-button);"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
				Search tools…
			</button>

			<!-- Nav links -->
			<a
				href="/tools"
				onclick={() => uiStore.closeMobileMenu()}
				class="px-3 py-2.5 text-sm font-medium rounded transition-colors
				       {isToolsActive
					? 'text-[--color-text] bg-[--color-surface]'
					: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
			>
				All Tools
			</a>

			{#each activeVerticals as vertical (vertical.id)}
				{@const active = isVerticalActive(vertical)}
				<a
					href="/{vertical.slug}"
					onclick={() => uiStore.closeMobileMenu()}
					class="px-3 py-2.5 text-sm font-medium rounded transition-colors
					       {active
						? 'text-[--color-text] bg-[--color-surface]'
						: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface]'}"
				>
					{vertical.name}
				</a>
			{/each}

			<div class="mt-2 pt-2 border-t border-[--color-border] flex flex-col gap-1">
				<a
					href="/learn"
					onclick={() => uiStore.closeMobileMenu()}
					class="px-3 py-2.5 text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
				>
					Learn
				</a>
				<a
					href="/about"
					onclick={() => uiStore.closeMobileMenu()}
					class="px-3 py-2.5 text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
				>
					About
				</a>
				<a
					href="/submit"
					onclick={() => uiStore.closeMobileMenu()}
					class="px-3 py-2.5 text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
				>
					Submit a tool
				</a>
			</div>
		</div>
	{/if}
</header>
