<script lang="ts">
	/**
	 * SeoHead — drop into any page's <svelte:head> via a single component.
	 *
	 * Handles:
	 *   - <title> with site suffix
	 *   - meta description (truncated to 155 chars)
	 *   - Open Graph (og:title, og:description, og:type, og:url, og:image)
	 *   - Twitter Card
	 *   - Canonical URL (query params stripped by default)
	 *   - Optional JSON-LD block (pass a plain object, serialised here)
	 *
	 * Usage:
	 *   <SeoHead
	 *     title="Circle — Stablecoin Payments Tool"
	 *     description="Circle provides USDC issuance and payment APIs…"
	 *     canonical="https://jeremycode.com/tools/circle"
	 *     image="https://…/circle-logo.png"
	 *     type="article"
	 *     jsonLd={{ '@type': 'SoftwareApplication', … }}
	 *   />
	 *
	 * The SITE_SUFFIX is appended to title unless the title already ends with it.
	 */

	const SITE_SUFFIX = '| Jeremy Code';
	const SITE_NAME = 'Jeremy Code';
	const DEFAULT_IMAGE = 'https://jeremycode.com/og-default.png';

	interface Props {
		/** Page title — suffix appended automatically */
		title: string;
		/** Meta description — truncated to 155 chars */
		description: string;
		/** Canonical URL — pass full absolute URL. Omit for noindex pages. */
		canonical?: string;
		/** og:image / twitter:image — absolute URL */
		image?: string;
		/** og:type — defaults to "website" */
		type?: 'website' | 'article';
		/** Structured data — serialised to JSON-LD script tag */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
		/** Prevent indexing (e.g. paginated pages beyond page 1) */
		noindex?: boolean;
	}

	let {
		title,
		description,
		canonical,
		image = DEFAULT_IMAGE,
		type = 'website',
		jsonLd,
		noindex = false
	}: Props = $props();

	const fullTitle = $derived(
		title.endsWith(SITE_SUFFIX) ? title : `${title} ${SITE_SUFFIX}`
	);

	const truncatedDescription = $derived(
		description.length > 155 ? `${description.slice(0, 152)}…` : description
	);

	// Strip fragment and common filter params from canonical
	const cleanCanonical = $derived(() => {
		if (!canonical) return undefined;
		try {
			const u = new URL(canonical);
			// Remove params that should never be in canonical
			const noCanonical = ['page', 'sort', 'search'];
			for (const p of noCanonical) u.searchParams.delete(p);
			u.hash = '';
			return u.toString();
		} catch {
			return canonical;
		}
	});

	const jsonLdString = $derived(
		jsonLd ? JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd) : null
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>

	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta name="description" content={truncatedDescription} />

	<!-- Canonical -->
	{#if cleanCanonical()}
		<link rel="canonical" href={cleanCanonical()} />
	{/if}

	<!-- Open Graph -->
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={truncatedDescription} />
	{#if cleanCanonical()}
		<meta property="og:url" content={cleanCanonical()} />
	{/if}
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={title} />

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={truncatedDescription} />
	<meta name="twitter:image" content={image} />

	<!-- JSON-LD -->
	{#if jsonLdString}
		{@html `<script type="application/ld+json">${jsonLdString}</script>`}
	{/if}
</svelte:head>
