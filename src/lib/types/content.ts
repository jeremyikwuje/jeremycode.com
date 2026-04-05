export interface Region {
	id: string;
	slug: string;
	name: string;
	code?: string;
	description: string | null;
	tool_count?: number;
}

export type LearnContentSource = 'substack' | 'youtube';

export interface LearnContent {
	id: string;
	title: string;
	url: string;
	source: LearnContentSource;
	description: string | null;
	associated_tools: Array<{ id: string; slug: string; name: string }>;
	associated_verticals: Array<{ id: string; slug: string; name: string }>;
	display_order: number;
	created_at: string;
	updated_at: string;
}

export interface Comparison {
	id: string;
	slug: string;
	tool_a_id: string;
	tool_b_id: string;
	/** Per-attribute winner overrides set by admin */
	highlights: Record<string, 'a' | 'b' | 'tie'>;
	created_at: string;
	updated_at: string;
}

export interface UseCase {
	id: string;
	slug: string;
	name: string;
	description: string | null;
}
