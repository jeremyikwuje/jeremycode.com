import { fail, redirect } from '@sveltejs/kit';
import { login } from '$lib/api/index.js';
import type { Actions } from './$types.js';

const COOKIE_NAME = 'admin_token';

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/' });
		redirect(303, '/backoffice/login');
	},

	default: async ({ request, fetch, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString().trim() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		const errors: Record<string, string> = {};
		if (!email) errors.email = 'Email is required';
		if (!password) errors.password = 'Password is required';

		if (Object.keys(errors).length > 0) {
			return fail(422, { errors, values: { email } });
		}

		try {
			const result = await login(fetch, { email, password });

			// Store the JWT in an HTTP-only secure cookie
			cookies.set(COOKIE_NAME, result.access_token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				// 7-day expiry — the JWT has its own expiry which the hook checks
				maxAge: 60 * 60 * 24 * 7
			});
		} catch (err) {
			return fail(401, {
				errors: { _form: 'Invalid email or password' },
				values: { email }
			});
		}

		redirect(303, '/backoffice');
	}
};
