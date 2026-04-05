import { fail } from '@sveltejs/kit';
import {
	adminGetLearnContent,
	adminCreateLearnContent,
	adminUpdateLearnContent,
	adminDeleteLearnContent,
	adminGetVerticals
} from '$lib/api/index.js';
import type { LearnContentSource } from '$lib/types/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch }) => {
	const [result, verticals] = await Promise.all([
		adminGetLearnContent(fetch),
		adminGetVerticals(fetch)
	]);

	return { content: result.data, total: result.total, verticals };
};

export const actions: Actions = {
	create: async ({ request, fetch }) => {
		const fd = await request.formData();

		const payload = {
			title: fd.get('title')?.toString().trim() ?? '',
			url: fd.get('url')?.toString().trim() ?? '',
			source: (fd.get('source')?.toString() ?? 'substack') as LearnContentSource,
			description: fd.get('description')?.toString().trim() || null,
			associated_tools: [] as Array<{ id: string; slug: string; name: string }>,
			associated_verticals: fd.getAll('vertical_ids').map((id) => ({
				id: id.toString(), slug: '', name: ''
			})),
			display_order: Number(fd.get('display_order') ?? 0)
		};

		if (!payload.title || !payload.url) return fail(422, { error: 'Title and URL are required' });

		try {
			await adminCreateLearnContent(fetch, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';

		try {
			await adminUpdateLearnContent(fetch, id, {
				title: fd.get('title')?.toString().trim() ?? '',
				url: fd.get('url')?.toString().trim() ?? '',
				source: (fd.get('source')?.toString() ?? 'substack') as LearnContentSource,
				description: fd.get('description')?.toString().trim() || null,
				associated_verticals: fd.getAll('vertical_ids').map((vid) => ({
					id: vid.toString(), slug: '', name: ''
				})),
				display_order: Number(fd.get('display_order') ?? 0)
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
			await adminDeleteLearnContent(fetch, id);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
