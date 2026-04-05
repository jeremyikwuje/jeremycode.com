import type { Category, Vertical } from './vertical.js';
import type { ExpertTake } from './expert.js';
import type { Region } from './content.js';

export type PricingModel = 'free' | 'freemium' | 'usage_based' | 'enterprise';
export type DifficultyRating = 'beginner' | 'intermediate' | 'advanced';

/**
 * The value stored for a single dynamic attribute on a tool.
 * Type narrows based on the corresponding AttributeDefinition.value_type.
 */
export type AttributeValue = string | string[] | boolean;

export interface Tool {
	id: string;
	slug: string;
	name: string;
	tagline: string;
	description: string;
	website_url: string;
	logo_url: string | null;
	vertical: Vertical;
	category: Category;
	has_public_api: boolean;
	api_type: string | null;
	has_sandbox: boolean;
	sdk_languages: string[];
	docs_url: string | null;
	github_url: string | null;
	open_source: boolean;
	pricing_model: PricingModel;
	difficulty_rating: DifficultyRating | null;
	regions: Region[];
	secondary_tags: string[];
	/**
	 * Dynamic vertical-specific attributes.
	 * Keys match AttributeDefinition.key for the tool's vertical.
	 */
	attributes: Record<string, AttributeValue>;
	/** Zero or more expert opinions — never assume exactly one */
	expert_takes: ExpertTake[];
	is_published: boolean;
	is_featured: boolean;
	/** Position in the 9-slot featured grid; null if not featured */
	featured_order: number | null;
	created_at: string;
	updated_at: string;
}
