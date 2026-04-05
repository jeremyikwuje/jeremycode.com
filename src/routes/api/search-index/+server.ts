import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types.js';

/**
 * Internal search-index endpoint.
 *
 * The CommandPalette fetches this same-origin route client-side so it
 * never needs to know API_BASE_URL (a server-only env var). The response
 * is a flat array of minimal tool objects suitable for Fuse.js indexing.
 */
export const GET: RequestHandler = async ({ fetch }) => {
	const base = (env.API_BASE_URL ?? '').replace(/\/$/, '');

	if (!base) {
		return json([]);
	}

	const res = await fetch(`${base}/v1/tools?per_page=500&page=1`, {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		return json([]);
	}

	const envelope = await res.json() as { data?: unknown[] };
	const tools = envelope.data ?? [];

	return json(tools, {
		headers: {
			// Cache on the CDN for 2 minutes, serve stale for up to 10
			'Cache-Control': 's-maxage=120, stale-while-revalidate=600'
		}
	});
};
