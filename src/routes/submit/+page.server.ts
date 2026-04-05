import { fail, redirect } from '@sveltejs/kit';
import { getVerticals } from '$lib/api/index.js';
import { apiMutate } from '$lib/api/client.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { verticals } = await parent();

	// Ensure attribute definitions are loaded for each vertical — they drive
	// the dynamic fields in step 3 of the form.
	const activeVerticals = verticals.filter((v) => v.is_active);

	return { verticals: activeVerticals };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();

		const verticalId = data.get('vertical_id');
		const toolName = data.get('tool_name');
		const websiteUrl = data.get('website_url');
		const tagline = data.get('tagline');
		const submitterEmail = data.get('submitter_email');

		// Basic required-field validation
		const errors: Record<string, string> = {};
		if (!verticalId) errors.vertical_id = 'Please select a vertical';
		if (!toolName || String(toolName).trim().length < 2) errors.tool_name = 'Tool name is required';
		if (!websiteUrl || !String(websiteUrl).startsWith('http'))
			errors.website_url = 'A valid website URL is required';
		if (!tagline || String(tagline).trim().length < 10)
			errors.tagline = 'Tagline must be at least 10 characters';
		if (!submitterEmail || !String(submitterEmail).includes('@'))
			errors.submitter_email = 'A valid email is required';

		if (Object.keys(errors).length > 0) {
			return fail(422, {
				errors,
				values: Object.fromEntries(data)
			});
		}

		// Collect all dynamic attribute fields (prefixed "attr_")
		const attributes: Record<string, string> = {};
		for (const [key, value] of data.entries()) {
			if (key.startsWith('attr_')) {
				attributes[key.slice(5)] = String(value);
			}
		}

		try {
			await apiMutate('POST', '/v1/submissions', fetch, {
				vertical_id: verticalId,
				tool_name: String(toolName).trim(),
				website_url: String(websiteUrl).trim(),
				tagline: String(tagline).trim(),
				description: String(data.get('description') ?? '').trim(),
				submitter_email: String(submitterEmail).trim(),
				attributes
			});
		} catch {
			return fail(500, {
				errors: { _form: 'Submission failed — please try again.' },
				values: Object.fromEntries(data)
			});
		}

		redirect(303, '/submit?success=1');
	}
};
