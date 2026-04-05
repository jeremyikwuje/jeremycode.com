import { fail } from '@sveltejs/kit';
import {
	adminGetSubmissions,
	adminGetVerticals,
	adminUpdateSubmissionStatus
} from '$lib/api/index.js';
import type { SubmissionStatus } from '$lib/types/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const status = (url.searchParams.get('status') ?? undefined) as SubmissionStatus | undefined;
	const verticalId = url.searchParams.get('vertical') ?? undefined;
	const page = Number(url.searchParams.get('page') ?? 1);

	const [result, verticals] = await Promise.all([
		adminGetSubmissions(fetch, { status, vertical_id: verticalId, page, per_page: 20 }),
		adminGetVerticals(fetch)
	]);

	return {
		submissions: result.data,
		total: result.total,
		currentPage: result.page,
		perPage: result.per_page,
		verticals,
		filters: { status, verticalId }
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';
		const status = fd.get('status')?.toString() as SubmissionStatus;
		const notes = fd.get('notes')?.toString().trim() || undefined;

		try {
			await adminUpdateSubmissionStatus(fetch, id, status, notes);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
