<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Vertical, AttributeDefinition } from '$lib/types/index.js';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const success = $derived(page.url.searchParams.get('success') === '1');

	// Step state — driven locally since form is progressive-enhanced
	let step = $state(1);
	let selectedVertical = $state<Vertical | null>(null);

	// When a vertical is selected, load its filterable attribute definitions
	// for step 3. Nothing hardcoded — driven entirely by data.
	const attrDefs = $derived<AttributeDefinition[]>(
		selectedVertical?.attribute_definitions.filter(
			(d) => d.value_type !== 'boolean' || true // include all types in the form
		) ?? []
	);

	function selectVertical(v: Vertical) {
		selectedVertical = v;
		step = 2;
	}

	const errors = $derived(form?.errors ?? {}) as Record<string, string>;
	// Cast to a permissive type — values come from FormData entries, always strings
	const values = $derived((form as { values?: Record<string, unknown> } | null)?.values ?? {});

	// Restore selected vertical from form values on validation failure
	$effect(() => {
		const vid = form?.values?.vertical_id as string | undefined;
		if (vid && !selectedVertical) {
			selectedVertical = data.verticals.find((v) => v.id === vid) ?? null;
		}
	});
</script>

<SeoHead
	title="Submit a Tool"
	description="Submit a fintech tool to the Jeremy Code directory. Submissions are reviewed before publishing."
	canonical="{page.url.origin}/submit"
/>

<div class="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
	{#if success}
		<!-- Success state -->
		<div class="text-center py-12">
			<div
				class="inline-flex items-center justify-center w-14 h-14 mb-5
				       bg-[color:color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
				style="border-radius: 50%;"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="var(--color-primary)"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-[--color-text] mb-2" style="font-family: var(--font-display);">
				Submission received
			</h1>
			<p class="text-[--color-text-muted] mb-6">
				Thanks — your submission is in the queue for review.
			</p>
			<div class="flex justify-center gap-3">
				<Button href="/tools">Browse the directory</Button>
				<Button href="/submit" variant="ghost">Submit another</Button>
			</div>
		</div>
	{:else}
		<header class="mb-8">
			<h1 class="text-2xl sm:text-3xl font-bold text-[--color-text]" style="font-family: var(--font-display);">
				Submit a tool
			</h1>
			<p class="mt-2 text-sm text-[--color-text-muted]">
				All submissions are reviewed before publishing. Typically 2–3 business days.
			</p>

			<!-- Step indicator -->
			<div class="flex items-center gap-2 mt-5">
				{#each [1, 2, 3] as s}
					<div
						class="h-1.5 rounded-full transition-all duration-200"
						style="
						  width: {step >= s ? '2rem' : '1rem'};
						  background-color: {step >= s ? 'var(--color-primary)' : 'var(--color-border)'};
						"
					></div>
				{/each}
				<span class="text-xs text-[--color-text-muted] ml-1">Step {step} of 3</span>
			</div>
		</header>

		{#if form?.errors?._form}
			<div
				class="mb-6 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
				style="border-radius: var(--radius-card);"
				role="alert"
			>
				{form.errors._form}
			</div>
		{/if}

		<form method="POST" use:enhance class="space-y-8">
			<!-- Step 1: Select vertical -->
			{#if step === 1}
				<fieldset>
					<legend class="text-base font-semibold text-[--color-text] mb-4">
						Which vertical does this tool belong to?
					</legend>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{#each data.verticals as v (v.id)}
							{@const color = v.accent_colour ?? 'var(--color-primary)'}
							<button
								type="button"
								onclick={() => selectVertical(v)}
								class="flex items-start gap-3 p-4 text-left border transition-colors
								       {selectedVertical?.id === v.id
									? 'border-[--color-primary]'
									: 'border-[--color-border] hover:border-[--color-text-muted]'}
								       bg-[--color-surface]"
								style="border-radius: var(--radius-card);"
							>
								{#if v.icon}
									<span class="text-xl shrink-0">{v.icon}</span>
								{/if}
								<div>
									<p class="text-sm font-medium" style="color: {color};">{v.name}</p>
									<p class="text-xs text-[--color-text-muted] mt-0.5 line-clamp-2">
										{v.description}
									</p>
								</div>
							</button>
						{/each}
					</div>
					{#if errors.vertical_id}
						<p class="mt-2 text-xs text-red-400" role="alert">{errors.vertical_id}</p>
					{/if}
				</fieldset>

				{#if selectedVertical}
					<Button type="button" onclick={() => (step = 2)}>
						Continue with {selectedVertical.name}
					</Button>
				{/if}
			{/if}

			<!-- Step 2: Core tool fields -->
			{#if step >= 2}
				{#if selectedVertical}
					<input type="hidden" name="vertical_id" value={selectedVertical.id} />
				{/if}

				<div class="space-y-5">
					<div class="flex items-center justify-between">
						<h2 class="text-base font-semibold text-[--color-text]">Tool details</h2>
						{#if step > 1}
							<button
								type="button"
								onclick={() => (step = 1)}
								class="text-xs text-[--color-text-muted] hover:text-[--color-text] transition-colors"
							>
								← Change vertical
							</button>
						{/if}
					</div>

					<Input
						name="tool_name"
						label="Tool name *"
						placeholder="e.g. Circle"
						value={values.tool_name as string ?? ''}
						error={errors.tool_name ?? null}
						required
					/>
					<Input
						name="website_url"
						label="Website URL *"
						type="url"
						placeholder="https://example.com"
						value={values.website_url as string ?? ''}
						error={errors.website_url ?? null}
						required
					/>
					<Input
						name="tagline"
						label="Tagline * (max 80 chars)"
						placeholder="One-line description of what this tool does"
						maxlength={80}
						value={values.tagline as string ?? ''}
						error={errors.tagline ?? null}
						required
					/>

					<div class="flex flex-col gap-1.5">
						<label for="description" class="text-sm font-medium text-[--color-text]">
							Description (200–500 words recommended)
						</label>
						<textarea
							id="description"
							name="description"
							rows={5}
							placeholder="What does this tool do? Who is it for? What makes it worth listing?"
							class="px-3 py-2 text-sm text-[--color-text] placeholder:text-[--color-text-muted]
							       focus:outline-none transition-colors resize-y"
							style="background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-button);"
						>{values.description as string ?? ''}</textarea>
					</div>

					<Button type="button" onclick={() => (step = 3)}>Continue</Button>
				</div>
			{/if}

			<!-- Step 3: Vertical-specific attributes + submitter email -->
			{#if step >= 3}
				<div class="space-y-5">
					<h2 class="text-base font-semibold text-[--color-text]">
						{selectedVertical?.name ?? 'Vertical'} attributes
					</h2>

					<!--
						Dynamic attribute fields driven by the selected vertical's
						attribute_definitions. Adding a new attribute definition in admin
						causes a new field to appear here automatically — no code change.
					-->
					{#each attrDefs as def (def.id)}
						<div class="flex flex-col gap-1.5">
							<label
								for="attr_{def.key}"
								class="text-sm font-medium text-[--color-text]"
							>
								{def.display_name}
							</label>

							{#if def.value_type === 'multi_select' || def.value_type === 'single_select'}
								<div class="flex flex-wrap gap-2">
									{#each def.allowed_values as opt}
										<label class="flex items-center gap-1.5 text-sm text-[--color-text-muted] cursor-pointer">
											<input
												type={def.value_type === 'multi_select' ? 'checkbox' : 'radio'}
												name="attr_{def.key}"
												value={opt}
												class="accent-[--color-primary]"
											/>
											{opt}
										</label>
									{/each}
								</div>
							{:else if def.value_type === 'boolean'}
								<label class="flex items-center gap-2 text-sm text-[--color-text-muted] cursor-pointer">
									<input type="checkbox" name="attr_{def.key}" value="true" class="accent-[--color-primary]" />
									Yes
								</label>
							{:else}
								<input
									id="attr_{def.key}"
									type="text"
									name="attr_{def.key}"
									placeholder={def.display_name}
									class="h-10 px-3 text-sm text-[--color-text] placeholder:text-[--color-text-muted]
									       focus:outline-none transition-colors"
									style="background: var(--color-surface-1); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-button);"
								/>
							{/if}
						</div>
					{/each}

					<div class="pt-4" style="border-top: 1px solid var(--color-border-subtle);">
						<Input
							name="submitter_email"
							label="Your email * (not published)"
							type="email"
							placeholder="you@example.com"
							value={values.submitter_email as string ?? ''}
							error={errors.submitter_email ?? null}
							hint="We'll notify you when your submission is reviewed."
							required
						/>
					</div>

					<div class="flex flex-wrap gap-3 pt-2">
						<Button type="submit">Submit for review</Button>
						<Button type="button" variant="ghost" onclick={() => (step = 2)}>
							← Back
						</Button>
					</div>
				</div>
			{/if}
		</form>
	{/if}
</div>
