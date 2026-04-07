<script lang="ts">
	const currentYear = new Date().getFullYear();

	const links = [
		{ label: 'Newsletter', href: '/newsletter' },
		{ label: 'About', href: '/about' },
		{ label: 'Recommend', href: '/submit' },
		{ label: 'llms.txt', href: '/llms.txt' },
	];
</script>

<footer class="mt-16" style="border-top: 1px solid var(--color-border-subtle);">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
		<!-- Main row -->
		<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm" style="color: var(--color-text-secondary);">
			<span class="shrink-0">&copy; {currentYear} Jeremy Code</span>

			{#each links as link}
				<a
					href={link.href}
					class="hover:text-[--color-text] transition-colors"
				>
					{link.label}
				</a>
			{/each}

			<a
				href="mailto:hello@jeremycode.com"
				class="hover:text-[--color-text] transition-colors"
			>
				Contact us: hello@jeremycode.com
			</a>

			<!-- X / Twitter -->
			<a
				href="https://x.com/jeremyikwuje"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Jeremy Code on X"
				class="hover:text-[--color-text] transition-colors"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
				</svg>
			</a>
		</div>

		<!-- Disclaimer -->
		<p class="mt-3 text-xs leading-relaxed" style="color: var(--color-text-tertiary);">
			Disclaimer: Use of any product listed on Jeremy Code is at your own risk. Jeremy Code provides information for educational and discovery purposes only and is not liable for any loss, damage, or consequence arising from the use of any tool or service featured on this site.
		</p>
	</div>
</footer>
