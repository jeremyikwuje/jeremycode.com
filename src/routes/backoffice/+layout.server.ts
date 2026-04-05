import { adminGetSubmissions } from '$lib/api/index.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals, fetch, url }) => {
	// Login page is accessible without auth — skip guard and admin data
	if (url.pathname === '/backoffice/login') {
		return {
			adminUser: locals.adminUser ?? null,
			pendingSubmissions: 0
		};
	}

	// All other backoffice pages require auth (hooks.server.ts handles the redirect)
	if (!locals.adminUser) {
		return {
			adminUser: null,
			pendingSubmissions: 0
		};
	}

	// Fetch pending submission count for the nav badge
	let pendingSubmissions = 0;
	try {
		const result = await adminGetSubmissions(fetch, { status: 'pending', per_page: 1 });
		pendingSubmissions = result.total;
	} catch {
		// Non-critical — badge just shows 0
	}

	return {
		adminUser: locals.adminUser,
		pendingSubmissions
	};
};
