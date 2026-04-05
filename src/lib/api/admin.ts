import type {
	Vertical,
	Category,
	AttributeDefinition,
	Tool,
	Expert,
	ExpertTake,
	LearnContent,
	Comparison
} from '$lib/types/index.js';
import type {
	AdminUser,
	AuditLogEntry,
	DashboardMetrics,
	Submission,
	SubmissionStatus
} from '$lib/types/admin.js';
import type { PaginatedResponse } from '$lib/types/api.js';
import { apiGet, apiMutate, normalizePaginated } from './client.js';
import type { ApiFetch } from './client.js';

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardMetrics(
	fetch: ApiFetch,
	verticalId?: string
): Promise<DashboardMetrics> {
	return apiGet<DashboardMetrics>('/v1/admin/dashboard', fetch, {
		vertical_id: verticalId
	});
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResponse {
	access_token: string;
	/** May come as `user` from the API (camelToSnake handles the key) */
	admin_user?: AdminUser;
	user?: AdminUser;
	refresh_token?: string;
}

export async function login(fetch: ApiFetch, payload: LoginPayload): Promise<LoginResponse> {
	return apiMutate<LoginResponse>('POST', '/v1/admin/auth/login', fetch, payload);
}

// ── Verticals ─────────────────────────────────────────────────────────────────

export async function adminGetVerticals(fetch: ApiFetch): Promise<Vertical[]> {
	return apiGet<Vertical[]>('/v1/admin/verticals', fetch);
}

export async function adminCreateVertical(
	fetch: ApiFetch,
	payload: Omit<Vertical, 'id' | 'categories' | 'attribute_definitions' | 'tool_count'>
): Promise<Vertical> {
	return apiMutate<Vertical>('POST', '/v1/admin/verticals', fetch, payload);
}

export async function adminUpdateVertical(
	fetch: ApiFetch,
	id: string,
	payload: Partial<Omit<Vertical, 'id' | 'categories' | 'attribute_definitions' | 'tool_count'>>
): Promise<Vertical> {
	return apiMutate<Vertical>('PUT', `/v1/admin/verticals/${id}`, fetch, payload);
}

export async function adminDeleteVertical(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/verticals/${id}`, fetch);
}

export async function adminReorderVerticals(
	fetch: ApiFetch,
	orderedIds: string[]
): Promise<void> {
	return apiMutate<void>('PUT', '/v1/admin/verticals/order', fetch, { ids: orderedIds });
}

// ── Attribute Definitions ─────────────────────────────────────────────────────

export async function adminGetAttributeDefinitions(
	fetch: ApiFetch,
	verticalId: string
): Promise<AttributeDefinition[]> {
	return apiGet<AttributeDefinition[]>(
		`/v1/admin/verticals/${verticalId}/attributes`,
		fetch
	);
}

export async function adminCreateAttributeDefinition(
	fetch: ApiFetch,
	verticalId: string,
	payload: Omit<AttributeDefinition, 'id' | 'vertical_id'>
): Promise<AttributeDefinition> {
	return apiMutate<AttributeDefinition>(
		'POST',
		`/v1/admin/verticals/${verticalId}/attributes`,
		fetch,
		payload
	);
}

export async function adminUpdateAttributeDefinition(
	fetch: ApiFetch,
	verticalId: string,
	attrId: string,
	payload: Partial<Omit<AttributeDefinition, 'id' | 'vertical_id'>>
): Promise<AttributeDefinition> {
	return apiMutate<AttributeDefinition>(
		'PUT',
		`/v1/admin/verticals/${verticalId}/attributes/${attrId}`,
		fetch,
		payload
	);
}

export async function adminDeleteAttributeDefinition(
	fetch: ApiFetch,
	verticalId: string,
	attrId: string
): Promise<void> {
	return apiMutate<void>(
		'DELETE',
		`/v1/admin/verticals/${verticalId}/attributes/${attrId}`,
		fetch
	);
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function adminGetCategories(
	fetch: ApiFetch,
	verticalId: string
): Promise<Category[]> {
	return apiGet<Category[]>(`/v1/admin/verticals/${verticalId}/categories`, fetch);
}

export async function adminCreateCategory(
	fetch: ApiFetch,
	verticalId: string,
	payload: Omit<Category, 'id' | 'vertical_id' | 'tool_count'>
): Promise<Category> {
	return apiMutate<Category>(
		'POST',
		`/v1/admin/verticals/${verticalId}/categories`,
		fetch,
		payload
	);
}

export async function adminUpdateCategory(
	fetch: ApiFetch,
	verticalId: string,
	categoryId: string,
	payload: Partial<Omit<Category, 'id' | 'vertical_id' | 'tool_count'>>
): Promise<Category> {
	return apiMutate<Category>(
		'PUT',
		`/v1/admin/verticals/${verticalId}/categories/${categoryId}`,
		fetch,
		payload
	);
}

export async function adminDeleteCategory(
	fetch: ApiFetch,
	verticalId: string,
	categoryId: string
): Promise<void> {
	return apiMutate<void>(
		'DELETE',
		`/v1/admin/verticals/${verticalId}/categories/${categoryId}`,
		fetch
	);
}

export async function adminReorderCategories(
	fetch: ApiFetch,
	verticalId: string,
	orderedIds: string[]
): Promise<void> {
	return apiMutate<void>(
		'PUT',
		`/v1/admin/verticals/${verticalId}/categories/order`,
		fetch,
		{ ids: orderedIds }
	);
}

// ── Tools ─────────────────────────────────────────────────────────────────────

export interface AdminToolFilters {
	vertical_id?: string;
	category_id?: string;
	status?: 'published' | 'draft';
	search?: string;
	page?: number;
	per_page?: number;
}

export async function adminGetTools(
	fetch: ApiFetch,
	filters: AdminToolFilters = {}
): Promise<PaginatedResponse<Tool>> {
	const raw = await apiGet<unknown>('/v1/admin/tools', fetch, filters as Record<string, unknown>);
	return normalizePaginated<Tool>(raw);
}

export async function adminGetTool(fetch: ApiFetch, id: string): Promise<Tool> {
	return apiGet<Tool>(`/v1/admin/tools/${id}`, fetch);
}

export async function adminCreateTool(
	fetch: ApiFetch,
	payload: unknown
): Promise<Tool> {
	return apiMutate<Tool>('POST', '/v1/admin/tools', fetch, payload);
}

export async function adminUpdateTool(
	fetch: ApiFetch,
	id: string,
	payload: unknown
): Promise<Tool> {
	return apiMutate<Tool>('PUT', `/v1/admin/tools/${id}`, fetch, payload);
}

export async function adminDeleteTool(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/tools/${id}`, fetch);
}

export async function adminPatchTool(
	fetch: ApiFetch,
	id: string,
	patch: { is_published?: boolean; is_featured?: boolean; featured_order?: number | null }
): Promise<Tool> {
	return apiMutate<Tool>('PATCH', `/v1/admin/tools/${id}`, fetch, patch);
}

// ── Featured Tools ────────────────────────────────────────────────────────────

export async function adminGetFeaturedTools(fetch: ApiFetch): Promise<Tool[]> {
	return apiGet<Tool[]>('/v1/admin/featured', fetch);
}

export async function adminSaveFeaturedTools(
	fetch: ApiFetch,
	orderedToolIds: string[]
): Promise<void> {
	return apiMutate<void>('PUT', '/v1/admin/featured', fetch, { ids: orderedToolIds });
}

// ── Experts ───────────────────────────────────────────────────────────────────

export async function adminGetExperts(fetch: ApiFetch): Promise<Expert[]> {
	return apiGet<Expert[]>('/v1/admin/experts', fetch);
}

export async function adminCreateExpert(
	fetch: ApiFetch,
	payload: Omit<Expert, 'id'>
): Promise<Expert> {
	return apiMutate<Expert>('POST', '/v1/admin/experts', fetch, payload);
}

export async function adminUpdateExpert(
	fetch: ApiFetch,
	id: string,
	payload: Partial<Omit<Expert, 'id'>>
): Promise<Expert> {
	return apiMutate<Expert>('PUT', `/v1/admin/experts/${id}`, fetch, payload);
}

export async function adminDeleteExpert(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/experts/${id}`, fetch);
}

// ── Expert Takes ──────────────────────────────────────────────────────────────

export interface AdminExpertTakeFilters {
	expert_id?: string;
	vertical_id?: string;
	tool_id?: string;
	page?: number;
	per_page?: number;
}

export async function adminGetExpertTakes(
	fetch: ApiFetch,
	filters: AdminExpertTakeFilters = {}
): Promise<PaginatedResponse<ExpertTake>> {
	const raw = await apiGet<unknown>('/v1/admin/expert-takes', fetch, filters as Record<string, unknown>);
	return normalizePaginated<ExpertTake>(raw);
}

export async function adminCreateExpertTake(
	fetch: ApiFetch,
	payload: { tool_id: string; expert_id: string; content: string; verified: boolean }
): Promise<ExpertTake> {
	return apiMutate<ExpertTake>('POST', '/v1/admin/expert-takes', fetch, payload);
}

export async function adminUpdateExpertTake(
	fetch: ApiFetch,
	id: string,
	payload: Partial<{ content: string; verified: boolean }>
): Promise<ExpertTake> {
	return apiMutate<ExpertTake>('PUT', `/v1/admin/expert-takes/${id}`, fetch, payload);
}

export async function adminDeleteExpertTake(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/expert-takes/${id}`, fetch);
}

// ── Submissions ───────────────────────────────────────────────────────────────

export interface SubmissionFilters {
	status?: SubmissionStatus;
	vertical_id?: string;
	page?: number;
	per_page?: number;
}

export async function adminGetSubmissions(
	fetch: ApiFetch,
	filters: SubmissionFilters = {}
): Promise<PaginatedResponse<Submission>> {
	const raw = await apiGet<unknown>('/v1/admin/submissions', fetch, filters as Record<string, unknown>);
	return normalizePaginated<Submission>(raw);
}

export async function adminUpdateSubmissionStatus(
	fetch: ApiFetch,
	id: string,
	status: SubmissionStatus,
	notes?: string
): Promise<Submission> {
	return apiMutate<Submission>('PATCH', `/v1/admin/submissions/${id}/status`, fetch, {
		status,
		notes
	});
}

// ── Learn Content ─────────────────────────────────────────────────────────────

export async function adminGetLearnContent(
	fetch: ApiFetch
): Promise<PaginatedResponse<LearnContent>> {
	const raw = await apiGet<unknown>('/v1/admin/learn', fetch);
	return normalizePaginated<LearnContent>(raw);
}

export async function adminCreateLearnContent(
	fetch: ApiFetch,
	payload: Omit<LearnContent, 'id' | 'created_at' | 'updated_at'>
): Promise<LearnContent> {
	return apiMutate<LearnContent>('POST', '/v1/admin/learn', fetch, payload);
}

export async function adminUpdateLearnContent(
	fetch: ApiFetch,
	id: string,
	payload: Partial<Omit<LearnContent, 'id' | 'created_at' | 'updated_at'>>
): Promise<LearnContent> {
	return apiMutate<LearnContent>('PUT', `/v1/admin/learn/${id}`, fetch, payload);
}

export async function adminDeleteLearnContent(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/learn/${id}`, fetch);
}

// ── Comparisons ───────────────────────────────────────────────────────────────

export async function adminGetComparisons(
	fetch: ApiFetch
): Promise<PaginatedResponse<Comparison>> {
	const raw = await apiGet<unknown>('/v1/admin/comparisons', fetch);
	return normalizePaginated<Comparison>(raw);
}

export async function adminCreateComparison(
	fetch: ApiFetch,
	payload: { tool_a_id: string; tool_b_id: string }
): Promise<Comparison> {
	return apiMutate<Comparison>('POST', '/v1/admin/comparisons', fetch, payload);
}

export async function adminUpdateComparison(
	fetch: ApiFetch,
	id: string,
	payload: { highlights: Comparison['highlights'] }
): Promise<Comparison> {
	return apiMutate<Comparison>('PUT', `/v1/admin/comparisons/${id}`, fetch, payload);
}

export async function adminDeleteComparison(fetch: ApiFetch, id: string): Promise<void> {
	return apiMutate<void>('DELETE', `/v1/admin/comparisons/${id}`, fetch);
}

// ── Admin Users ───────────────────────────────────────────────────────────────

export async function adminGetUsers(fetch: ApiFetch): Promise<AdminUser[]> {
	return apiGet<AdminUser[]>('/v1/admin/users', fetch);
}

export async function adminInviteUser(
	fetch: ApiFetch,
	payload: { email: string; name: string; role: AdminUser['role'] }
): Promise<AdminUser> {
	return apiMutate<AdminUser>('POST', '/v1/admin/users', fetch, payload);
}

export async function adminUpdateUser(
	fetch: ApiFetch,
	id: string,
	payload: Partial<{ role: AdminUser['role']; is_active: boolean }>
): Promise<AdminUser> {
	return apiMutate<AdminUser>('PATCH', `/v1/admin/users/${id}`, fetch, payload);
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditFilters {
	admin_user_id?: string;
	action?: string;
	entity_type?: string;
	date_from?: string;
	date_to?: string;
	page?: number;
	per_page?: number;
}

export async function adminGetAuditLogs(
	fetch: ApiFetch,
	filters: AuditFilters = {}
): Promise<PaginatedResponse<AuditLogEntry>> {
	const raw = await apiGet<unknown>('/v1/admin/audit-logs', fetch, filters as Record<string, unknown>);
	return normalizePaginated<AuditLogEntry>(raw);
}
