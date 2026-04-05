import { error, fail } from '@sveltejs/kit';
import {
	adminGetVerticals,
	adminGetCategories,
	adminCreateCategory,
	adminUpdateCategory,
	adminDeleteCategory
} from '$lib/api/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const verticals = await adminGetVerticals(fetch);
	const verticalId = url.searchParams.get('vertical') ?? verticals[0]?.id ?? '';

	const selectedVertical = verticals.find((v) => v.id === verticalId) ?? null;
	const categories = selectedVertical
		? await adminGetCategories(fetch, verticalId)
		: [];

	return { verticals, selectedVertical, categories };
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();
		const verticalId = fd.get('vertical_id')?.toString() ?? '';

		const payload = {
			name: fd.get('name')?.toString().trim() ?? '',
			slug: fd.get('slug')?.toString().trim() ?? '',
			description: fd.get('description')?.toString().trim() || null,
			color_code: fd.get('colour')?.toString().trim() || null,
			display_order: Number(fd.get('display_order') ?? 0)
		};

		if (!payload.name) return fail(422, { error: 'Name is required' });
		if (!payload.slug) return fail(422, { error: 'Slug is required' });

		try {
			await adminCreateCategory(fetch, verticalId, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch }) => {
		const fd = await request.formData();
		const verticalId = fd.get('vertical_id')?.toString() ?? '';
		const categoryId = fd.get('category_id')?.toString() ?? '';

		const payload = {
			name: fd.get('name')?.toString().trim() ?? '',
			slug: fd.get('slug')?.toString().trim() ?? '',
			description: fd.get('description')?.toString().trim() || null,
			color_code: fd.get('colour')?.toString().trim() || null,
			display_order: Number(fd.get('display_order') ?? 0)
		};

		try {
			await adminUpdateCategory(fetch, verticalId, categoryId, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch }) => {
		const fd = await request.formData();
		const verticalId = fd.get('vertical_id')?.toString() ?? '';
		const categoryId = fd.get('category_id')?.toString() ?? '';

		try {
			await adminDeleteCategory(fetch, verticalId, categoryId);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
