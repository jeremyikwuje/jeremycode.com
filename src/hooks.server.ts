import { redirect, type Handle } from '@sveltejs/kit';
import type { AdminUser } from '$lib/types/admin.js';

const COOKIE_NAME = 'admin_token';
const BACKOFFICE_PREFIX = '/backoffice';
const LOGIN_PATH = '/backoffice/login';

/**
 * Decode a JWT payload without verification.
 * Real authorization happens at the API layer — the hook is a frontend
 * guard that extracts user info and checks expiry for UX purposes.
 */
function decodeJwtPayload(token: string): { user: AdminUser; exp: number } | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payload = JSON.parse(atob(parts[1]));
		if (!payload.sub || !payload.exp) return null;
		return {
			user: {
				id: payload.sub,
				email: payload.email ?? '',
				name: payload.name ?? '',
				role: payload.role ?? 'editor',
				is_active: payload.is_active ?? true,
				created_at: payload.created_at ?? ''
			},
			exp: payload.exp
		};
	} catch {
		return null;
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	// Default — no admin user
	event.locals.adminUser = null;

	const { pathname } = event.url;

	// Only process backoffice routes
	if (!pathname.startsWith(BACKOFFICE_PREFIX)) {
		return resolve(event);
	}

	// Login page is always accessible
	if (pathname === LOGIN_PATH) {
		// If already authenticated, redirect to dashboard
		const token = event.cookies.get(COOKIE_NAME);
		if (token) {
			const decoded = decodeJwtPayload(token);
			if (decoded && decoded.exp * 1000 > Date.now()) {
				redirect(303, '/backoffice');
			}
		}
		return resolve(event);
	}

	// All other /backoffice routes require authentication
	const token = event.cookies.get(COOKIE_NAME);

	if (!token) {
		redirect(303, LOGIN_PATH);
	}

	const decoded = decodeJwtPayload(token);

	if (!decoded || decoded.exp * 1000 <= Date.now()) {
		// Expired or malformed — clear cookie, redirect to login
		event.cookies.delete(COOKIE_NAME, { path: '/' });
		redirect(303, LOGIN_PATH);
	}

	event.locals.adminUser = decoded.user;

	return resolve(event);
};
