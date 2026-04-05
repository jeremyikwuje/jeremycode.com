export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	per_page: number;
}

export interface ApiError {
	message: string;
	code: string;
	field?: string;
}

export interface ToolFilters {
	vertical?: string;
	category?: string;
	region?: string;
	api_type?: string;
	pricing_model?: string;
	has_public_api?: boolean;
	featured?: boolean;
	search?: string;
	page?: number;
	per_page?: number;
	/** Dynamic vertical-specific attribute filters, e.g. { chains: ['Ethereum', 'Solana'] } */
	attributes?: Record<string, string | string[] | boolean>;
}
