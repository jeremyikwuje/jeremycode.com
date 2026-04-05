export type AdminRole = 'super_admin' | 'editor';

export interface AdminUser {
	id: string;
	email: string;
	name: string;
	role: AdminRole;
	is_active: boolean;
	created_at: string;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface Submission {
	id: string;
	tool_name: string;
	vertical_id: string;
	submitter_email: string;
	/** Raw submitted field values, keyed by field name */
	submitted_data: Record<string, unknown>;
	status: SubmissionStatus;
	review_notes: string | null;
	created_at: string;
	updated_at: string;
}

export type AuditEntityType =
	| 'vertical'
	| 'attribute_definition'
	| 'category'
	| 'tool'
	| 'expert'
	| 'expert_take'
	| 'submission'
	| 'learn_content'
	| 'admin_user'
	| 'featured_tools';

export type AuditAction =
	| 'create'
	| 'update'
	| 'delete'
	| 'publish'
	| 'unpublish'
	| 'activate'
	| 'deactivate'
	| 'feature'
	| 'unfeature'
	| 'reorder'
	| 'approve'
	| 'reject'
	| 'request_changes';

export interface AuditLogEntry {
	id: string;
	admin_user_id: string;
	admin_user_name: string;
	action: AuditAction;
	entity_type: AuditEntityType;
	entity_id: string;
	entity_label: string;
	diff: Record<string, unknown> | null;
	created_at: string;
}

export interface DashboardMetrics {
	total_published_tools: number;
	tools_by_vertical: Array<{ vertical_id: string; vertical_name: string; count: number }>;
	pending_submissions: number;
	tools_added_this_month: number;
	expert_take_coverage_rate: number;
}
