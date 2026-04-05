import { error, fail } from '@sveltejs/kit';
import { adminGetUsers, adminInviteUser, adminUpdateUser } from '$lib/api/index.js';
import type { AdminRole } from '$lib/types/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const users = await adminGetUsers(fetch);
	return { users };
};

export const actions: Actions = {
	invite: async ({ request, fetch }) => {
		const fd = await request.formData();
		const email = fd.get('email')?.toString().trim() ?? '';
		const name = fd.get('name')?.toString().trim() ?? '';
		const role = (fd.get('role')?.toString() ?? 'editor') as AdminRole;

		if (!email || !name) return fail(422, { error: 'Email and name are required' });

		try {
			await adminInviteUser(fetch, { email, name, role });
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	updateUser: async ({ request, fetch }) => {
		const fd = await request.formData();
		const id = fd.get('id')?.toString() ?? '';
		const role = fd.get('role')?.toString() as AdminRole | undefined;
		const isActive = fd.get('is_active');

		const payload: { role?: AdminRole; is_active?: boolean } = {};
		if (role) payload.role = role;
		if (isActive !== null) payload.is_active = isActive === 'true';

		try {
			await adminUpdateUser(fetch, id, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
