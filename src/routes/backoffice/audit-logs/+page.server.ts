import { error } from '@sveltejs/kit';
import { adminGetAuditLogs, adminGetUsers } from '$lib/api/index.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch, url }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const adminUserId = url.searchParams.get('admin') ?? undefined;
	const entityType = url.searchParams.get('entity') ?? undefined;
	const action = url.searchParams.get('action') ?? undefined;
	const page = Number(url.searchParams.get('page') ?? 1);

	const [result, users] = await Promise.all([
		adminGetAuditLogs(fetch, {
			admin_user_id: adminUserId,
			entity_type: entityType,
			action,
			page,
			per_page: 30
		}),
		adminGetUsers(fetch).catch(() => [])
	]);

	return {
		logs: result.data,
		total: result.total,
		currentPage: result.page,
		perPage: result.per_page,
		users,
		filters: { adminUserId, entityType, action }
	};
};
