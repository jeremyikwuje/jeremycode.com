export type AttributeValueType = 'multi_select' | 'single_select' | 'boolean' | 'text';

export interface AttributeDefinition {
	id: string;
	vertical_id: string;
	/** Machine-readable key, e.g. "chains" */
	key: string;
	/** Human-readable label, e.g. "Supported Chains" */
	display_name: string;
	value_type: AttributeValueType;
	/** Valid options for select types; empty for boolean/text */
	allowed_values: string[];
	/** Whether this attribute appears as a filter in FilterPanel */
	filterable: boolean;
	display_order: number;
}

export interface Category {
	id: string;
	vertical_id: string;
	slug: string;
	name: string;
	description: string | null;
	/** Hex colour code — API field `colorCode` → `color_code` */
	color_code: string | null;
	/** @deprecated Use color_code */
	colour?: string | null;
	display_order: number;
	tool_count?: number;
}

export interface Vertical {
	id: string;
	slug: string;
	name: string;
	description: string;
	icon: string | null;
	/** Hex colour for vertical accent; falls back to --color-primary */
	accent_colour: string | null;
	is_active: boolean;
	display_order: number;
	categories: Category[];
	attribute_definitions: AttributeDefinition[];
	tool_count?: number;
	category_count?: number;
}
