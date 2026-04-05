import { getVerticals } from '$lib/api/index.js';
import { getTools } from '$lib/api/tools.js';
import type { RequestHandler } from './$types.js';

/**
 * Dynamic sitemap.xml — includes all active verticals, their categories,
 * all published tool detail pages, and static routes.
 *
 * Cache-Control: s-maxage=3600 (1 hour CDN), stale-while-revalidate=86400 (1 day).
 * This means new tools and verticals appear in the sitemap within an hour
 * without requiring a deployment.
 */

const ORIGIN = 'https://jeremycode.com';

const STATIC_ROUTES: Array<{ path: string; priority: number; changefreq: string }> = [
	{ path: '/', priority: 1.0, changefreq: 'daily' },
	{ path: '/tools', priority: 0.9, changefreq: 'hourly' },
	{ path: '/learn', priority: 0.7, changefreq: 'weekly' },
	{ path: '/about', priority: 0.4, changefreq: 'monthly' },
	{ path: '/submit', priority: 0.5, changefreq: 'monthly' }
];

function url(
	path: string,
	priority: number,
	changefreq: string,
	lastmod?: string
): string {
	return [
		'  <url>',
		`    <loc>${ORIGIN}${path}</loc>`,
		lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
		`    <changefreq>${changefreq}</changefreq>`,
		`    <priority>${priority.toFixed(1)}</priority>`,
		'  </url>'
	]
		.filter(Boolean)
		.join('\n');
}

export const GET: RequestHandler = async ({ fetch }) => {
	// Fetch verticals and tools in parallel
	const [verticals, toolsResponse] = await Promise.all([
		getVerticals(fetch).catch(() => []),
		getTools(fetch, { per_page: 500, page: 1 }).catch(() => ({
			data: [],
			total: 0,
			page: 1,
			per_page: 500
		}))
	]);

	const activeVerticals = verticals.filter((v) => v.is_active);
	const tools = toolsResponse.data;

	const urls: string[] = [];

	// Static routes
	for (const route of STATIC_ROUTES) {
		urls.push(url(route.path, route.priority, route.changefreq));
	}

	// Vertical landing pages
	for (const vertical of activeVerticals) {
		urls.push(url(`/${vertical.slug}`, 0.8, 'daily'));

		// Category pages within each vertical
		for (const category of vertical.categories) {
			urls.push(url(`/${vertical.slug}/${category.slug}`, 0.7, 'daily'));
		}
	}

	// Tool detail pages
	for (const tool of tools) {
		const lastmod = tool.updated_at
			? new Date(tool.updated_at).toISOString().slice(0, 10)
			: undefined;
		urls.push(url(`/tools/${tool.slug}`, 0.8, 'weekly', lastmod));
	}

	const sitemap = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>'
	].join('\n');

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
		}
	});
};
