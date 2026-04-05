<script lang="ts">
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<SeoHead
	title="About"
	description="Jeremy Code is a curated directory of fintech infrastructure tools for developers, product teams, and founders — built by a developer who uses these APIs."
	canonical="https://jeremycode.com/about"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About Jeremy Code',
		url: 'https://jeremycode.com/about',
		description:
			'A curated directory of fintech infrastructure tools for developers, product teams, and founders.',
		author: {
			'@type': 'Person',
			name: 'Jeremy',
			url: 'https://jeremycode.com'
		}
	}}
/>

<article class="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
	<header class="mb-10">
		<h1
			class="text-3xl sm:text-4xl font-bold text-[--color-text]"
			style="font-family: var(--font-display);"
		>
			About Jeremy Code
		</h1>
		<div class="mt-4 h-1 w-16 bg-[--color-primary]" style="border-radius: 2px;"></div>
	</header>

	<div class="space-y-6 text-[--color-text] leading-relaxed">
		<p>
			Fintech infrastructure is fragmented. When you're building a product that needs stablecoin
			settlement, KYC verification, or cross-border payment rails, you spend weeks evaluating APIs
			before writing a single line of integration code.
		</p>

		<p>
			Jeremy Code exists to compress that evaluation time. It's a curated, technically-opinionated
			directory of the fintech APIs developers actually encounter when building — with structured
			comparisons, integration details, and honest takes from people who have used them.
		</p>

		<h2
			class="text-xl font-semibold text-[--color-text] pt-4"
			style="font-family: var(--font-display);"
		>
			What makes this different
		</h2>

		<ul class="space-y-3 pl-4 text-[--color-text-muted]">
			<li class="flex gap-2">
				<span class="text-[--color-primary] shrink-0 mt-0.5" aria-hidden="true">→</span>
				<span>
					<strong class="text-[--color-text]">Engineer-first.</strong> Every listing includes API
					type, SDK languages, sandbox availability, and integration difficulty — not just marketing
					copy.
				</span>
			</li>
			<li class="flex gap-2">
				<span class="text-[--color-primary] shrink-0 mt-0.5" aria-hidden="true">→</span>
				<span>
					<strong class="text-[--color-text]">Expert takes.</strong> Commentary from developers who
					have integrated these tools — not aggregate star ratings.
				</span>
			</li>
			<li class="flex gap-2">
				<span class="text-[--color-primary] shrink-0 mt-0.5" aria-hidden="true">→</span>
				<span>
					<strong class="text-[--color-text]">Multi-vertical.</strong> Launching with stablecoins
					and expanding to payments, KYC, lending, and more — a single place as the fintech stack
					grows.
				</span>
			</li>
			<li class="flex gap-2">
				<span class="text-[--color-primary] shrink-0 mt-0.5" aria-hidden="true">→</span>
				<span>
					<strong class="text-[--color-text]">Zero noise.</strong> No affiliate links, no
					pay-to-play rankings, no third-party tracking scripts.
				</span>
			</li>
		</ul>

		<h2
			class="text-xl font-semibold text-[--color-text] pt-4"
			style="font-family: var(--font-display);"
		>
			Who it's for
		</h2>

		<p class="text-[--color-text-muted]">
			Developers evaluating APIs before integration. Product teams scoping a fintech feature.
			Founders deciding which infrastructure partners to build on. Anyone who wants to understand
			what's available across the fintech stack without wading through vendor marketing.
		</p>

		<h2
			class="text-xl font-semibold text-[--color-text] pt-4"
			style="font-family: var(--font-display);"
		>
			Submit a tool
		</h2>

		<p class="text-[--color-text-muted]">
			Know a fintech API that should be listed? Submissions are reviewed manually before publishing.
		</p>

		<div class="flex flex-wrap gap-3 pt-2">
			<Button href="/submit">Submit a tool</Button>
			<Button href="/tools" variant="ghost">Browse the directory</Button>
		</div>
	</div>
</article>
