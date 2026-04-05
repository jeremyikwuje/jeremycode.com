import { error, fail } from '@sveltejs/kit';
import {
	adminGetVerticals,
	adminGetAttributeDefinitions,
	adminCreateAttributeDefinition,
	adminUpdateAttributeDefinition,
	adminDeleteAttributeDefinition
} from '$lib/api/index.js';
import type { AttributeValueType } from '$lib/types/index.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ locals, fetch, params }) => {
	if (locals.adminUser?.role !== 'super_admin') {
		error(403, 'Super admin access required');
	}

	const [verticals, attributes] = await Promise.all([
		adminGetVerticals(fetch),
		adminGetAttributeDefinitions(fetch, params.id)
	]);

	const vertical = verticals.find((v) => v.id === params.id);
	if (!vertical) error(404, 'Vertical not found');

	return { vertical, attributes };
};

function parseAllowedValues(fd: FormData): string[] {
	const raw = fd.get('allowed_values')?.toString().trim() ?? '';
	if (!raw) return [];
	return raw.split(',').map((v) => v.trim()).filter(Boolean);
}

export const actions: Actions = {
	create: async ({ request, fetch, params }) => {
		const fd = await request.formData();
		const valueType = (fd.get('value_type')?.toString() ?? 'text') as AttributeValueType;

		const payload = {
			key: fd.get('key')?.toString().trim() ?? '',
			display_name: fd.get('display_name')?.toString().trim() ?? '',
			value_type: valueType,
			allowed_values: parseAllowedValues(fd),
			filterable: fd.get('filterable') === 'on',
			display_order: Number(fd.get('display_order') ?? 0)
		};

		if (!payload.key) return fail(422, { error: 'Key is required' });
		if (!payload.display_name) return fail(422, { error: 'Display name is required' });

		try {
			await adminCreateAttributeDefinition(fetch, params.id, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	update: async ({ request, fetch, params }) => {
		const fd = await request.formData();
		const attrId = fd.get('attr_id')?.toString() ?? '';
		const valueType = (fd.get('value_type')?.toString() ?? 'text') as AttributeValueType;

		const payload = {
			key: fd.get('key')?.toString().trim() ?? '',
			display_name: fd.get('display_name')?.toString().trim() ?? '',
			value_type: valueType,
			allowed_values: parseAllowedValues(fd),
			filterable: fd.get('filterable') === 'on',
			display_order: Number(fd.get('display_order') ?? 0)
		};

		try {
			await adminUpdateAttributeDefinition(fetch, params.id, attrId, payload);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	},

	delete: async ({ request, fetch, params }) => {
		const fd = await request.formData();
		const attrId = fd.get('attr_id')?.toString() ?? '';

		try {
			await adminDeleteAttributeDefinition(fetch, params.id, attrId);
		} catch (err) {
			return fail(400, { error: String(err) });
		}

		return { success: true };
	}
};
