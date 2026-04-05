import { env } from '$env/dynamic/private';

export type ApiFetch = typeof globalThis.fetch;

export class ApiRequestError extends Error {
	constructor(
		public readonly status: number,
		public readonly path: string,
		message: string
	) {
		super(message);
		this.name = 'ApiRequestError';
	}
}

// ── camelCase → snake_case key transformation ────────────────────────────────

function camelToSnakeKey(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform all object keys from camelCase to snake_case.
 * Arrays are traversed; primitives pass through unchanged.
 */
function transformKeys(obj: unknown): unknown {
	if (Array.isArray(obj)) return obj.map(transformKeys);
	if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
			result[camelToSnakeKey(key)] = transformKeys(value);
		}
		return result;
	}
	return obj;
}

/**
 * Unwrap the API envelope. The backend wraps responses in `{ "data": ... }`.
 * - Paginated responses have `data` + `total` + `page` → return as-is
 *   (already matches PaginatedResponse<T>).
 * - Everything else: unwrap `.data` so callers get the inner payload.
 */
function unwrapEnvelope(raw: unknown): unknown {
	if (raw && typeof raw === 'object' && 'data' in (raw as Record<string, unknown>)) {
		const obj = raw as Record<string, unknown>;
		// Paginated — keep the envelope
		if ('total' in obj || 'page' in obj || 'per_page' in obj) {
			return obj;
		}
		return obj.data;
	}
	return raw;
}

/**
 * Process a raw API JSON response: transform keys then unwrap envelope.
 */
function processResponse<T>(raw: unknown): T {
	const transformed = transformKeys(raw);
	return unwrapEnvelope(transformed) as T;
}

/**
 * Normalise the API's paginated shape `{ items, total, page, limit, pages }`
 * into our frontend PaginatedResponse `{ data, total, page, per_page }`.
 */
export function normalizePaginated<T>(raw: unknown): { data: T[]; total: number; page: number; per_page: number } {
	const obj = (raw ?? {}) as Record<string, unknown>;
	return {
		data: (obj.items ?? obj.data ?? []) as T[],
		total: (obj.total ?? 0) as number,
		page: (obj.page ?? 1) as number,
		per_page: (obj.limit ?? obj.per_page ?? 24) as number
	};
}

// ── Public helpers ───────────────────────────────────────────────────────────

/**
 * Core GET helper. All data fetching goes through here.
 * Always pass the `fetch` from the SvelteKit load function so SSR
 * request deduplication and cookie forwarding work correctly.
 */
export async function apiGet<T>(
	path: string,
	fetch: ApiFetch,
	// Intentionally permissive — callers pass typed filter objects
	params?: Record<string, unknown>
): Promise<T> {
	const base = (env.API_BASE_URL ?? '').replace(/\/$/, '');
	const url = new URL(`${base}${path}`);

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null) {
				url.searchParams.set(key, String(value));
			}
		}
	}

	const res = await fetch(url.toString(), {
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new ApiRequestError(res.status, path, body || `HTTP ${res.status}`);
	}

	const raw = await res.json();
	return processResponse<T>(raw);
}

/**
 * POST / PUT / PATCH helper for admin mutation endpoints.
 * Reads the JWT from the HTTP-only cookie automatically because
 * SvelteKit's server-side fetch forwards cookies.
 */
export async function apiMutate<T>(
	method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: string,
	fetch: ApiFetch,
	body?: unknown
): Promise<T> {
	const base = (env.API_BASE_URL ?? '').replace(/\/$/, '');
	const url = `${base}${path}`;

	const res = await fetch(url, {
		method,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: body !== undefined ? JSON.stringify(body) : undefined
	});

	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
		throw new ApiRequestError(res.status, path, (err as { message?: string }).message ?? String(err));
	}

	// 204 No Content
	if (res.status === 204) return undefined as T;

	const raw = await res.json();
	return processResponse<T>(raw);
}
