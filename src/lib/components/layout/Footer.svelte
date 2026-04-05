<script lang="ts">
	import type { Vertical } from '$lib/types/index.js';

	interface Props {
		verticals?: Vertical[];
	}

	let { verticals = [] }: Props = $props();

	const activeVerticals = $derived(verticals.filter((v) => v.is_active));

	const currentYear = new Date().getFullYear();
</script>

<footer class="border-t border-[--color-border] bg-[--color-bg] mt-16">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
			<!-- Brand -->
			<div class="lg:col-span-1">
				<a
					href="/"
					class="text-[--color-text] font-bold text-lg tracking-tight hover:text-[--color-primary] transition-colors"
					style="font-family: var(--font-display);"
				>
					Jeremy Code
				</a>
				<p class="mt-3 text-sm text-[--color-text-muted] leading-relaxed max-w-xs">
					A curated directory of fintech infrastructure tools for developers, product teams, and
					founders.
				</p>
			</div>

			<!-- Verticals (data-driven) -->
			{#if activeVerticals.length > 0}
				<div>
					<h3 class="text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-3">
						Verticals
					</h3>
					<ul class="flex flex-col gap-2">
						{#each activeVerticals as vertical (vertical.id)}
							<li>
								<a
									href="/{vertical.slug}"
									class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
								>
									{vertical.name}
								</a>
							</li>
						{/each}
						<li>
							<a
								href="/tools"
								class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
							>
								All Tools
							</a>
						</li>
					</ul>
				</div>
			{/if}

			<!-- Directory -->
			<div>
				<h3 class="text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-3">
					Directory
				</h3>
				<ul class="flex flex-col gap-2">
					<li>
						<a
							href="/tools"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							Browse Tools
						</a>
					</li>
					<li>
						<a
							href="/learn"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							Learn
						</a>
					</li>
					<li>
						<a
							href="/submit"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							Submit a Tool
						</a>
					</li>
					<li>
						<a
							href="/about"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							About
						</a>
					</li>
				</ul>
			</div>

			<!-- Policies -->
			<div>
				<h3 class="text-xs font-semibold uppercase tracking-widest text-[--color-text-muted] mb-3">
					Legal
				</h3>
				<ul class="flex flex-col gap-2">
					<li>
						<a
							href="/privacy"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							Privacy Policy
						</a>
					</li>
					<li>
						<a
							href="/terms"
							class="text-sm text-[--color-text-muted] hover:text-[--color-text] transition-colors"
						>
							Terms of Use
						</a>
					</li>
				</ul>
			</div>
		</div>

		<!-- Bottom bar -->
		<div
			class="mt-10 pt-6 border-t border-[--color-border]
			       flex flex-col sm:flex-row items-center justify-between gap-4"
		>
			<p class="text-xs text-[--color-text-muted]">
				© {currentYear} Jeremy Code Ltd. All rights reserved.
			</p>
			<p class="text-xs text-[--color-text-muted]">
				Built for developers, by a developer.
			</p>
		</div>
	</div>
</footer>
