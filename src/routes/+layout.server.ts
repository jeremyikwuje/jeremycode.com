import { getVerticals } from '$lib/api/index.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ fetch }) => {
	// Verticals drive GlobalNav tabs on every page.
	// Graceful degradation: empty array if API is unreachable so the
	// rest of the site still renders.
	const verticals = await getVerticals(fetch).catch(() => []);

	return { verticals };
};
