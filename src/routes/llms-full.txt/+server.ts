import { getVerticals } from '$lib/api/index.js';
import { getTools } from '$lib/api/tools.js';
import type { RequestHandler } from './$types.js';

/**
 * Dynamic llms-full.txt — machine-readable index of all tools for LLM agents.
 *
 * Format per tool (pipe-delimited for easy parsing):
 *   name | vertical | category | api_type | regions | url
 *
 * Grouped by vertical for easier traversal by AI agents.
 * Regenerated on each CDN miss; stale for up to 1 hour.
 */
export const GET: RequestHandler = async ({ fetch }) => {
	const [verticals, toolsResponse] = await Promise.all([
		getVerticals(fetch).catch(() => []),
		getTools(fetch, { per_page: 500, page: 1 }).catch(() => ({
			data: [],
			total: 0,
			page: 1,
			per_page: 500
		}))
	]);

	const activeVerticals = verticals.filter((v) => v.is_active);
	const tools = toolsResponse.data;

	const lines: string[] = [
		'# jeremycode.com — Full Machine-Readable Tool Index',
		'# Format: name | vertical | category | api_type | regions | url',
		`# Generated: ${new Date().toISOString()}`,
		`# Total tools: ${tools.length}`,
		''
	];

	for (const vertical of activeVerticals) {
		const verticalTools = tools.filter((t) => t.vertical?.slug === vertical.slug);
		if (verticalTools.length === 0) continue;

		lines.push(`## ${vertical.name}`);
		if (vertical.description) lines.push(`# ${vertical.description}`);
		lines.push('');

		for (const tool of verticalTools) {
			const regions = tool.regions.map((r) => r.name).join(', ') || 'Global';
			const apiType = tool.has_public_api ? (tool.api_type ?? 'API') : 'No public API';
			lines.push(
				`${tool.name} | ${tool.vertical.name} | ${tool.category.name} | ${apiType} | ${regions} | https://jeremycode.com/tools/${tool.slug}`
			);
		}

		lines.push('');
	}

	// Tools with no matching active vertical (edge case)
	const orphaned = tools.filter(
		(t) => !activeVerticals.some((v) => v.slug === t.vertical?.slug)
	);
	if (orphaned.length > 0) {
		lines.push('## Other');
		for (const tool of orphaned) {
			const regions = tool.regions.map((r) => r.name).join(', ') || 'Global';
			const apiType = tool.has_public_api ? (tool.api_type ?? 'API') : 'No public API';
			lines.push(
				`${tool.name} | ${tool.vertical?.name ?? 'Unknown'} | ${tool.category.name} | ${apiType} | ${regions} | https://jeremycode.com/tools/${tool.slug}`
			);
		}
	}

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400'
		}
	});
};
