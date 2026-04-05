<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import SeoHead from '$lib/components/layout/SeoHead.svelte';
	import { AdminModal } from '$lib/components/backoffice/index.js';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { PageData, ActionData } from './$types.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let inviteOpen = $state(false);
</script>

<SeoHead title="Settings" description="Admin settings" noindex />

<div class="max-w-4xl">
	<h1 class="text-xl font-bold text-[--color-text] mb-6" style="font-family: var(--font-display);">Settings</h1>

	{#if form?.error}
		<div class="mb-4 px-4 py-3 text-sm text-red-400 bg-[color:color-mix(in_srgb,#ef4444_10%,transparent)] border border-red-800"
			style="border-radius: var(--radius-card);" role="alert">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="mb-4 px-4 py-3 text-sm text-green-400 bg-[color:color-mix(in_srgb,#22c55e_10%,transparent)] border border-green-800"
			style="border-radius: var(--radius-card);">Done.</div>
	{/if}

	<!-- Admin Users -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-base font-semibold text-[--color-text]" style="font-family: var(--font-display);">Admin Users</h2>
			<Button size="sm" onclick={() => (inviteOpen = true)}>Invite User</Button>
		</div>

		<div class="bg-[--color-surface] border border-[--color-border] overflow-hidden" style="border-radius: var(--radius-card);">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-[--color-border]">
						<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">User</th>
						<th class="text-left py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Email</th>
						<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Role</th>
						<th class="text-center py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Status</th>
						<th class="text-right py-3 px-4 text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each data.users as user (user.id)}
						<tr class="border-b border-[--color-border] last:border-0">
							<td class="py-3 px-4 font-medium text-[--color-text]">{user.name}</td>
							<td class="py-3 px-4 text-[--color-text-muted] text-xs">{user.email}</td>
							<td class="py-3 px-4 text-center">
								<Badge variant={user.role === 'super_admin' ? 'api' : 'category'}>
									{user.role === 'super_admin' ? 'Super Admin' : 'Editor'}
								</Badge>
							</td>
							<td class="py-3 px-4 text-center">
								<span class="text-xs {user.is_active ? 'text-green-400' : 'text-red-400'}">
									{user.is_active ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="py-3 px-4 text-right">
								<div class="flex items-center justify-end gap-2">
									{#if user.role !== 'super_admin'}
										<form method="POST" action="?/updateUser" use:enhance={() => {
											return async ({ update }) => { await update(); invalidateAll(); };
										}}>
											<input type="hidden" name="id" value={user.id} />
											<input type="hidden" name="is_active" value={!user.is_active} />
											<button type="submit" class="text-xs text-[--color-secondary] hover:underline">
												{user.is_active ? 'Deactivate' : 'Activate'}
											</button>
										</form>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<!-- Invite Modal -->
<AdminModal open={inviteOpen} title="Invite Admin User" onclose={() => (inviteOpen = false)}>
	<form method="POST" action="?/invite"
		use:enhance={() => { return async ({ result, update }) => { if (result.type === 'success') { inviteOpen = false; invalidateAll(); } await update(); }; }}
		class="flex flex-col gap-4">
		<Input name="name" label="Name *" placeholder="Jane Smith" required />
		<Input name="email" label="Email *" type="email" placeholder="jane@example.com" required />
		<div class="flex flex-col gap-1.5">
			<label for="invite-role" class="text-sm font-medium text-[--color-text]">Role</label>
			<select id="invite-role" name="role"
				class="h-10 px-3 text-sm bg-[--color-surface] border border-[--color-border] text-[--color-text] focus:outline-none focus:border-[--color-primary]"
				style="border-radius: var(--radius-button);">
				<option value="editor">Editor</option>
				<option value="super_admin">Super Admin</option>
			</select>
		</div>
		<div class="flex justify-end gap-3 pt-2">
			<Button type="button" variant="ghost" onclick={() => (inviteOpen = false)}>Cancel</Button>
			<Button type="submit">Send Invite</Button>
		</div>
	</form>
</AdminModal>
