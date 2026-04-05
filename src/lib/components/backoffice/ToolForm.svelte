<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type {
		Tool,
		Vertical,
		Region,
		PricingModel,
		DifficultyRating,
		AttributeDefinition
	} from '$lib/types/index.js';

	interface Props {
		/** All verticals with categories + attribute_definitions populated */
		verticals: Vertical[];
		/** All regions for the region multi-select */
		regions: Region[];
		/** Existing tool data when editing; null when creating */
		tool: Tool | null;
		/** Form action URL */
		action: string;
		/** Form action result from server */
		formResult: { error?: string } | null;
	}

	let { verticals, regions, tool, action, formResult }: Props = $props();

	// ── Vertical / category selection ────────────────────────────────────────

	let selectedVerticalId = $state(tool?.vertical.id ?? '');
	let selectedCategoryId = $state(tool?.category.id ?? '');

	const selectedVertical = $derived(
		verticals.find((v) => v.id === selectedVerticalId) ?? null
	);

	const categories = $derived(selectedVertical?.categories ?? []);

	const attributeDefs = $derived(selectedVertical?.attribute_definitions ?? []);

	// Reset category when vertical changes (unless editing)
	$effect(() => {
		if (selectedVerticalId && !tool) {
			selectedCategoryId = '';
		}
	});

	// ── Slug auto-generation ─────────────────────────────────────────────────

	let nameValue = $state(tool?.name ?? '');
	let slugLocked = $state(!!tool);
	let slugValue = $state(tool?.slug ?? '');

	function slugify(name: string): string {
		return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	$effect(() => {
		if (!slugLocked) {
			slugValue = slugify(nameValue);
		}
	});

	// ── Conditional API fields ───────────────────────────────────────────────

	let hasPublicApi = $state(tool?.has_public_api ?? false);

	// ── SDK languages (comma-separated) ──────────────────────────────────────

	let sdkInput = $state(tool?.sdk_languages.join(', ') ?? '');

	// ── Secondary tags (comma-separated) ─────────────────────────────────────

	let tagsInput = $state(tool?.secondary_tags.join(', ') ?? '');

	// ── Region selection ─────────────────────────────────────────────────────

	let selectedRegionIds = $state<Set<string>>(
		new Set(tool?.regions.map((r) => r.id) ?? [])
	);

	function toggleRegion(id: string) {
		const next = new Set(selectedRegionIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedRegionIds = next;
	}

	// ── Dynamic attributes ───────────────────────────────────────────────────

	let attrValues = $state<Record<string, string | string[] | boolean>>(
		tool?.attributes ?? {}
	);

	function getAttrString(key: string): string {
		const v = attrValues[key];
		if (typeof v === 'string') return v;
		return '';
	}

	function getAttrBool(key: string): boolean {
		return attrValues[key] === true;
	}

	function getAttrArray(key: string): string[] {
		const v = attrValues[key];
		if (Array.isArray(v)) return v;
		return [];
	}

	function setAttrString(key: string, value: string) {
		attrValues = { ...attrValues, [key]: value };
	}

	function setAttrBool(key: string, value: boolean) {
		attrValues = { ...attrValues, [key]: value };
	}

	function toggleAttrArrayValue(key: string, val: string) {
		const current = getAttrArray(key);
		const next = current.includes(val)
			? current.filter((v) => v !== val)
			: [...current, val];
		attrValues = { ...attrValues, [key]: next };
	}

	function setAttrSingle(key: string, val: string) {
		attrValues = { ...attrValues, [key]: val };
	}

	// ── Pricing / difficulty ─────────────────────────────────────────────────

	const pricingModels: { value: PricingModel; label: string }[] = [
		{ value: 'free', label: 'Free' },
		{ value: 'freemium', label: 'Freemium' },
		{ value: 'usage_based', label: 'Usage-based' },
		{ value: 'enterprise', label: 'Enterprise' }
	];

	const difficultyRatings: { value: DifficultyRating; label: string }[] = [
		{ value: 'beginner', label: 'Beginner' },
		{ value: 'intermediate', label: 'Intermediate' },
		{ value: 'advanced', label: 'Advanced' }
	];

	// ── Publishing ───────────────────────────────────────────────────────────

	let isPublished = $state(tool?.is_published ?? false);
	let isFeatured = $state(tool?.is_featured ?? false);

	// ── Word count for description ───────────────────────────────────────────

	let descriptionValue = $state(tool?.description ?? '');
	const wordCount = $derived(
		descriptionValue.trim() ? descriptionValue.trim().split(/\s+/).length : 0
	);
</script>

{#if formResult?.error}
	<div class="mb-6 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
		style="border-radius: var(--radius-card);" role="alert">
		{formResult.error}
	</div>
{/if}

<form
	method="POST"
	{action}
	use:enhance={() => {
		return async ({ update }) => {
			await update();
		};
	}}
	class="space-y-8 max-w-3xl"
>
	<!-- ──────────────── Section 1: Vertical & Category ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Vertical & Category
		</h2>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div class="flex flex-col gap-1.5">
				<label for="tf-vertical" class="text-sm font-medium text-[--color-text]">Vertical *</label>
				<select
					id="tf-vertical"
					name="vertical_id"
					class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
					style="border-radius: var(--radius-button);"
					bind:value={selectedVerticalId}
					required
				>
					<option value="" disabled>Select vertical</option>
					{#each verticals as v (v.id)}
						<option value={v.id}>{v.icon ?? ''} {v.name}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="tf-category" class="text-sm font-medium text-[--color-text]">Category *</label>
				<select
					id="tf-category"
					name="category_id"
					class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
					style="border-radius: var(--radius-button);"
					bind:value={selectedCategoryId}
					required
					disabled={!selectedVerticalId}
				>
					<option value="" disabled>Select category</option>
					{#each categories as c (c.id)}
						<option value={c.id}>{c.name}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>

	<!-- ──────────────── Section 2: Basic Information ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Basic Information
		</h2>

		<div class="space-y-4">
			<Input
				name="name"
				label="Name *"
				placeholder="e.g. Circle"
				value={nameValue}
				required
				oninput={(e: Event) => { nameValue = (e.target as HTMLInputElement).value; }}
			/>

			<div class="flex items-end gap-2">
				<div class="flex-1">
					<Input
						name="slug"
						label="Slug *"
						value={slugValue}
						required
						disabled={slugLocked}
						oninput={(e: Event) => { slugValue = (e.target as HTMLInputElement).value; }}
					/>
				</div>
				<button
					type="button"
					onclick={() => { slugLocked = !slugLocked; }}
					class="h-10 px-3 text-xs text-[--color-text-muted] bg-[--color-surface] border border-[--color-border] hover:text-[--color-text] transition-colors"
					style="border-radius: var(--radius-button);"
					title={slugLocked ? 'Unlock for manual editing' : 'Lock to auto-generate'}
				>
					{slugLocked ? 'Unlock' : 'Lock'}
				</button>
			</div>

			<Input
				name="tagline"
				label="Tagline * (max 80 chars)"
				placeholder="One-line description"
				maxlength={80}
				value={tool?.tagline ?? ''}
				required
			/>

			<Input
				name="website_url"
				label="Website URL *"
				type="url"
				placeholder="https://example.com"
				value={tool?.website_url ?? ''}
				required
			/>

			<Input
				name="logo_url"
				label="Logo URL"
				type="url"
				placeholder="https://example.com/logo.png"
				value={tool?.logo_url ?? ''}
				hint="Direct URL to tool logo image"
			/>
		</div>
	</section>

	<!-- ──────────────── Section 3: Technical Details ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Technical Details
		</h2>

		<div class="space-y-4">
			<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
				<input type="checkbox" name="has_public_api" class="accent-[--color-primary]"
					bind:checked={hasPublicApi} />
				Has Public API
			</label>

			{#if hasPublicApi}
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6 border-l-2 border-[--color-border]">
					<div class="flex flex-col gap-1.5">
						<label for="tf-api-type" class="text-sm font-medium text-[--color-text]">API Type</label>
						<select
							id="tf-api-type"
							name="api_type"
							class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
							style="border-radius: var(--radius-button);"
							value={tool?.api_type ?? ''}
						>
							<option value="">Select type</option>
							<option value="REST">REST</option>
							<option value="GraphQL">GraphQL</option>
							<option value="gRPC">gRPC</option>
							<option value="WebSocket">WebSocket</option>
							<option value="SDK-only">SDK-only</option>
						</select>
					</div>

					<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer self-end h-10">
						<input type="checkbox" name="has_sandbox" class="accent-[--color-primary]"
							checked={tool?.has_sandbox ?? false} />
						Has Sandbox
					</label>

					<Input
						name="docs_url"
						label="Docs URL"
						type="url"
						placeholder="https://docs.example.com"
						value={tool?.docs_url ?? ''}
					/>

					<Input
						name="sdk_languages"
						label="SDK Languages"
						placeholder="Python, JavaScript, Go"
						value={sdkInput}
						hint="Comma-separated"
						oninput={(e: Event) => { sdkInput = (e.target as HTMLInputElement).value; }}
					/>
				</div>
			{/if}

			<Input
				name="github_url"
				label="GitHub URL"
				type="url"
				placeholder="https://github.com/org/repo"
				value={tool?.github_url ?? ''}
			/>

			<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
				<input type="checkbox" name="open_source" class="accent-[--color-primary]"
					checked={tool?.open_source ?? false} />
				Open Source
			</label>
		</div>
	</section>

	<!-- ──────────────── Section 4: Vertical-Specific Attributes ──────────────── -->
	{#if attributeDefs.length > 0}
		<section>
			<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
				{selectedVertical?.name ?? 'Vertical'} Attributes
			</h2>
			<p class="text-xs text-[--color-text-muted] mb-4">
				These fields are defined by the vertical's attribute configuration. Changes propagate automatically.
			</p>

			<div class="space-y-4">
				{#each attributeDefs as def (def.id)}
					<div class="flex flex-col gap-1.5">
						<label class="text-sm font-medium text-[--color-text]">{def.display_name}</label>

						{#if def.value_type === 'multi_select'}
							<div class="flex flex-wrap gap-2">
								{#each def.allowed_values as opt}
									{@const checked = getAttrArray(def.key).includes(opt)}
									<label class="flex items-center gap-1.5 text-sm text-[--color-text-muted] cursor-pointer">
										<input
											type="checkbox"
											name="attr_{def.key}"
											value={opt}
											{checked}
											onchange={() => toggleAttrArrayValue(def.key, opt)}
											class="accent-[--color-primary]"
										/>
										{opt}
									</label>
								{/each}
							</div>

						{:else if def.value_type === 'single_select'}
							<select
								name="attr_{def.key}"
								class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
								style="border-radius: var(--radius-button);"
								value={getAttrString(def.key)}
								onchange={(e) => setAttrSingle(def.key, (e.target as HTMLSelectElement).value)}
							>
								<option value="">Select...</option>
								{#each def.allowed_values as opt}
									<option value={opt}>{opt}</option>
								{/each}
							</select>

						{:else if def.value_type === 'boolean'}
							<label class="flex items-center gap-2 text-sm text-[--color-text-muted] cursor-pointer">
								<input
									type="checkbox"
									name="attr_{def.key}"
									value="true"
									checked={getAttrBool(def.key)}
									onchange={(e) => setAttrBool(def.key, (e.target as HTMLInputElement).checked)}
									class="accent-[--color-primary]"
								/>
								Yes
							</label>

						{:else}
							<input
								type="text"
								name="attr_{def.key}"
								placeholder={def.display_name}
								value={getAttrString(def.key)}
								oninput={(e) => setAttrString(def.key, (e.target as HTMLInputElement).value)}
								class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors"
								style="border-radius: var(--radius-button);"
							/>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- ──────────────── Section 5: Classification ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Classification
		</h2>

		<div class="space-y-4">
			<Input
				name="secondary_tags"
				label="Secondary Tags"
				placeholder="stablecoin, payments, compliance"
				value={tagsInput}
				hint="Comma-separated"
				oninput={(e: Event) => { tagsInput = (e.target as HTMLInputElement).value; }}
			/>

			{#if regions.length > 0}
				<div class="flex flex-col gap-1.5">
					<label class="text-sm font-medium text-[--color-text]">Regions</label>
					<div class="flex flex-wrap gap-2">
						{#each regions as region (region.id)}
							<label class="flex items-center gap-1.5 text-sm text-[--color-text-muted] cursor-pointer">
								<input
									type="checkbox"
									name="region_ids"
									value={region.id}
									checked={selectedRegionIds.has(region.id)}
									onchange={() => toggleRegion(region.id)}
									class="accent-[--color-primary]"
								/>
								{region.name}
							</label>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- ──────────────── Section 6: Pricing ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Pricing
		</h2>

		<div class="flex flex-col gap-1.5">
			<label for="tf-pricing" class="text-sm font-medium text-[--color-text]">Pricing Model *</label>
			<select
				id="tf-pricing"
				name="pricing_model"
				class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
				style="border-radius: var(--radius-button);"
				value={tool?.pricing_model ?? 'freemium'}
				required
			>
				{#each pricingModels as pm}
					<option value={pm.value}>{pm.label}</option>
				{/each}
			</select>
		</div>
	</section>

	<!-- ──────────────── Section 7: Description ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Description
		</h2>

		<div class="space-y-4">
			<div class="flex flex-col gap-1.5">
				<label for="tf-description" class="text-sm font-medium text-[--color-text]">
					Description (200–500 words recommended)
				</label>
				<textarea
					id="tf-description"
					name="description"
					rows={8}
					placeholder="What does this tool do? Who is it for?"
					class="px-3 py-2 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] placeholder:text-[--color-text-muted] focus:outline-none focus:border-[--color-primary] transition-colors resize-y"
					style="border-radius: var(--radius-button);"
					bind:value={descriptionValue}
				></textarea>
				<p class="text-xs text-[--color-text-muted]">
					{wordCount} word{wordCount === 1 ? '' : 's'}
					{#if wordCount > 0 && wordCount < 200}
						<span class="text-yellow-400">— below recommended minimum</span>
					{:else if wordCount > 500}
						<span class="text-yellow-400">— above recommended maximum</span>
					{/if}
				</p>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="tf-difficulty" class="text-sm font-medium text-[--color-text]">Difficulty Rating</label>
				<select
					id="tf-difficulty"
					name="difficulty_rating"
					class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
					style="border-radius: var(--radius-button);"
					value={tool?.difficulty_rating ?? ''}
				>
					<option value="">No rating</option>
					{#each difficultyRatings as dr}
						<option value={dr.value}>{dr.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</section>

	<!-- ──────────────── Section 8: Publishing ──────────────── -->
	<section>
		<h2 class="text-base font-semibold text-[--color-text] mb-4" style="font-family: var(--font-display);">
			Publishing
		</h2>

		<div class="space-y-3">
			<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
				<input type="checkbox" name="is_published" class="accent-[--color-primary]"
					bind:checked={isPublished} />
				Published
			</label>
			<label class="flex items-center gap-2 text-sm text-[--color-text] cursor-pointer">
				<input type="checkbox" name="is_featured" class="accent-[--color-primary]"
					bind:checked={isFeatured} />
				Featured (max 9)
			</label>
		</div>
	</section>

	<!-- ──────────────── Submit ──────────────── -->
	<div class="flex items-center gap-3 pt-4 border-t border-[--color-border]">
		<Button type="submit">{tool ? 'Save Changes' : 'Create Tool'}</Button>
		<Button href="/backoffice/tools" variant="ghost">Cancel</Button>
	</div>
</form>
