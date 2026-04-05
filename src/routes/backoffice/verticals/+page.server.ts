import { error, fail, redirect } from '@sveltejs/kit';
import {
	adminGetVerticals,
	adminCreateVertical,
	adminUpdateVertical,
	adminDeleteVertical
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const verticals = await adminGetVerticals(fetch);
	return { verticals };
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();
		const payload = {
			name: fd.get('name')?.toString().trim() ?? '',
			slug: fd.get('slug')?.toString().trim() ?? '',
			description: fd.get('description')?.toString().trim() ?? '',
			icon: fd.get('icon')?.toString().trim() || null,
			accent_colour: fd.get('accent_colour')?.toString().trim() || null,
			is_active: fd.get('is_active') === 'on',
			display_order: Number(fd.get('display_order') ?? 0)
		};

		if (!payload.name) return fail(422, { error: 'Name is required' });
		if (!payload.slug) return fail(422, { error: 'Slug is required' });

		try {
			await adminCreateVertical(fetch, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		const payload = {
			name: fd.get('name')?.toString().trim() ?? '',
			slug: fd.get('slug')?.toString().trim() ?? '',
			description: fd.get('description')?.toString().trim() ?? '',
			icon: fd.get('icon')?.toString().trim() || null,
			accent_colour: fd.get('accent_colour')?.toString().trim() || null,
			is_active: fd.get('is_active') === 'on',
			display_order: Number(fd.get('display_order') ?? 0)
		};

		if (!payload.name) return fail(422, { error: 'Name is required' });

		try {
			await adminUpdateVertical(fetch, id, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminDeleteVertical(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	toggleActive: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';
		const is_active = fd.get('is_active') === 'true';

		try {
			await adminUpdateVertical(fetch, id, { is_active });
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
