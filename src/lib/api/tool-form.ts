/**
 * Shared form-data → API payload parser for tool create/edit.
 * Used by both /backoffice/tools/new and /backoffice/tools/[id]/edit
 * form actions to avoid duplicating the parsing logic.
 */
export function parseToolFormData(fd: FormData) {
	const sdkRaw = fd.get('sdk_languages')?.toString().trim() ?? '';
	const sdk_languages = sdkRaw ? sdkRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

	const tagsRaw = fd.get('secondary_tags')?.toString().trim() ?? '';
	const secondary_tags = tagsRaw ? tagsRaw.split(',').map((s) => s.trim()).filter(Boolean) : [];

	const region_ids = fd.getAll('region_ids').map((v) => v.toString());

	// Collect dynamic attribute values (attr_* fields)
	const attributes: Record<string, string | string[] | boolean> = {};
	for (const [key, value] of fd.entries()) {
		if (!key.startsWith('attr_')) continue;
		const attrKey = key.slice(5); // remove "attr_" prefix

		if (value === 'true' && fd.getAll(key).length === 1) {
			// Could be a boolean checkbox or a multi-select with one "true" value
			// Check if it was submitted from a boolean-type checkbox
			// We can't know the type here, so we treat single "true" as boolean
			// and multi-entries as an array
			attributes[attrKey] = true;
		} else {
			// Multiple values → array (multi_select checkboxes)
			const allValues = fd.getAll(key).map((v) => v.toString());
			if (allValues.length > 1) {
				attributes[attrKey] = allValues;
			} else {
				const single = allValues[0];
				// If a multi_select has exactly one checked value, it still needs to be an array
				// We disambiguate by checking if the value could be a boolean
				if (single === 'true') {
					attributes[attrKey] = true;
				} else {
					attributes[attrKey] = single;
				}
			}
		}
	}

	return {
		vertical_id: fd.get('vertical_id')?.toString() ?? '',
		category_id: fd.get('category_id')?.toString() ?? '',
		name: fd.get('name')?.toString().trim() ?? '',
		slug: fd.get('slug')?.toString().trim() ?? '',
		tagline: fd.get('tagline')?.toString().trim() ?? '',
		description: fd.get('description')?.toString().trim() ?? '',
		website_url: fd.get('website_url')?.toString().trim() ?? '',
		logo_url: fd.get('logo_url')?.toString().trim() || null,
		has_public_api: fd.get('has_public_api') === 'on',
		api_type: fd.get('api_type')?.toString().trim() || null,
		has_sandbox: fd.get('has_sandbox') === 'on',
		sdk_languages,
		docs_url: fd.get('docs_url')?.toString().trim() || null,
		github_url: fd.get('github_url')?.toString().trim() || null,
		open_source: fd.get('open_source') === 'on',
		pricing_model: fd.get('pricing_model')?.toString() ?? 'freemium',
		difficulty_rating: fd.get('difficulty_rating')?.toString() || null,
		secondary_tags,
		region_ids,
		attributes,
		is_published: fd.get('is_published') === 'on',
		is_featured: fd.get('is_featured') === 'on'
	};
}
