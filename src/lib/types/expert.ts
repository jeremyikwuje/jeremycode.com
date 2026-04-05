export interface Expert {
	id: string;
	slug: string;
	name: string;
	title: string;
	bio: string | null;
	avatar_url: string | null;
	is_default?: boolean;
}

export interface ExpertTake {
	id: string;
	tool_id: string;
	expert: Expert;
	/** Rich text content (Markdown) */
	content: string;
	/** True if the expert has personally integrated this tool */
	verified: boolean;
	published_at: string;
	updated_at: string;
}
