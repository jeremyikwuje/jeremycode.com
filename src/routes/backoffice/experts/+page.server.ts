import { error, fail } from '@sveltejs/kit';
import {
	adminGetExperts,
	adminCreateExpert,
	adminUpdateExpert,
	adminDeleteExpert
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const experts = await adminGetExperts(fetch);
	return { experts };
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();
		const name = fd.get('name')?.toString().trim() ?? '';
		const slug = fd.get('slug')?.toString().trim() ?? '';

		if (!name || !slug) return fail(422, { error: 'Name and slug are required' });

		try {
			await adminCreateExpert(fetch, {
				name,
				slug,
				title: fd.get('title')?.toString().trim() ?? '',
				bio: fd.get('bio')?.toString().trim() || null,
				avatar_url: fd.get('avatar_url')?.toString().trim() || null
			});
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminUpdateExpert(fetch, id, {
				name: fd.get('name')?.toString().trim() ?? '',
				slug: fd.get('slug')?.toString().trim() ?? '',
				title: fd.get('title')?.toString().trim() ?? '',
				bio: fd.get('bio')?.toString().trim() || null,
				avatar_url: fd.get('avatar_url')?.toString().trim() || null
			});
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminDeleteExpert(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
