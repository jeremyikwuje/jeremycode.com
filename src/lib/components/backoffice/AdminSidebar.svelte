<script lang="ts">
	import { page } from '$app/state';
	import type { AdminUser } from '$lib/types/admin.js';

	interface Props {
		adminUser: AdminUser;
		pendingSubmissions: number;
	}

	let { adminUser, pendingSubmissions }: Props = $props();

	const isSuperAdmin = $derived(adminUser.role === 'super_admin');

	interface NavItem {
		label: string;
		href: string;
		icon: string;
		badge?: number;
		superAdminOnly?: boolean;
	}

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/backoffice', icon: 'dashboard' },
		{ label: 'Tools', href: '/backoffice/tools', icon: 'tools' },
		{ label: 'Verticals', href: '/backoffice/verticals', icon: 'verticals', superAdminOnly: true },
		{ label: 'Categories', href: '/backoffice/categories', icon: 'categories', superAdminOnly: true },
		{ label: 'Expert Takes', href: '/backoffice/expert-takes', icon: 'expert-takes' },
		{ label: 'Experts', href: '/backoffice/experts', icon: 'experts', superAdminOnly: true },
		{ label: 'Submissions', href: '/backoffice/submissions', icon: 'submissions' },
		{ label: 'Featured', href: '/backoffice/featured', icon: 'featured' },
		{ label: 'Learn', href: '/backoffice/learn', icon: 'learn' },
		{ label: 'Comparisons', href: '/backoffice/comparisons', icon: 'comparisons' },
		{ label: 'Audit Logs', href: '/backoffice/audit-logs', icon: 'audit', superAdminOnly: true },
		{ label: 'Settings', href: '/backoffice/settings', icon: 'settings', superAdminOnly: true }
	];

	const visibleItems = $derived(
		navItems.filter((item) => !item.superAdminOnly || isSuperAdmin)
	);

	function isActive(href: string): boolean {
		const path = page.url.pathname as string;
		if (href === '/backoffice') return path === '/backoffice';
		return path.startsWith(href);
	}
</script>

<aside
	class="w-60 shrink-0 bg-[--color-surface] border-r border-[--color-border] flex flex-col h-full"
>
	<!-- Brand -->
	<div class="h-14 flex items-center px-4 border-b border-[--color-border]">
		<a href="/backoffice" class="flex items-center gap-2">
			<span
				class="text-base font-bold text-[--color-primary]"
				style="font-family: var(--font-display);"
			>
				Jeremy Code
			</span>
			<span
				class="text-[10px] font-medium uppercase tracking-wider text-[--color-text-muted] bg-[--color-surface-alt] px-1.5 py-0.5"
				style="border-radius: var(--radius-badge);"
			>
				Admin
			</span>
		</a>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto py-3 px-2" aria-label="Admin navigation">
		<ul class="flex flex-col gap-0.5">
			{#each visibleItems as item (item.href)}
				{@const active = isActive(item.href)}
				{@const badgeCount = item.label === 'Submissions' ? pendingSubmissions : (item.badge ?? 0)}
				<li>
					<a
						href={item.href}
						class="flex items-center gap-3 h-9 px-3 text-sm transition-colors
						       {active
							? 'bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[--color-primary] font-medium'
							: 'text-[--color-text-muted] hover:text-[--color-text] hover:bg-[--color-surface-alt]'}"
						style="border-radius: var(--radius-button);"
						aria-current={active ? 'page' : undefined}
					>
						{@html navIcon(item.icon)}
						<span class="flex-1 truncate">{item.label}</span>
						{#if badgeCount > 0}
							<span
								class="min-w-5 h-5 flex items-center justify-center px-1.5 text-[10px] font-bold
								       bg-[--color-primary] text-white"
								style="border-radius: 9999px;"
							>
								{badgeCount > 99 ? '99+' : badgeCount}
							</span>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- User info -->
	<div class="border-t border-[--color-border] px-4 py-3">
		<div class="flex items-center gap-3">
			<span
				class="w-8 h-8 flex items-center justify-center shrink-0 bg-[--color-surface-alt] text-[--color-text-muted] text-xs font-bold"
				style="border-radius: 50%;"
				aria-hidden="true"
			>
				{adminUser.name.charAt(0).toUpperCase()}
			</span>
			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium text-[--color-text] truncate">{adminUser.name}</p>
				<p class="text-[10px] text-[--color-text-muted] uppercase tracking-wider">
					{adminUser.role === 'super_admin' ? 'Super Admin' : 'Editor'}
				</p>
			</div>
		</div>
		<form method="POST" action="/backoffice/login?/logout" class="mt-2">
			<button
				type="submit"
				class="text-xs text-[--color-text-muted] hover:text-[--color-text] transition-colors"
			>
				Sign out
			</button>
		</form>
	</div>
</aside>

<script lang="ts" module>
	/**
	 * Minimal SVG icons for admin nav. Keeping them inline avoids
	 * an icon library dependency.
	 */
	function navIcon(key: string): string {
		const attrs = 'width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
		const icons: Record<string, string> = {
			dashboard: `<svg ${attrs}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
			tools: `<svg ${attrs}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
			verticals: `<svg ${attrs}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
			categories: `<svg ${attrs}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
			'expert-takes': `<svg ${attrs}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
			experts: `<svg ${attrs}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
			submissions: `<svg ${attrs}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>`,
			featured: `<svg ${attrs}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
			learn: `<svg ${attrs}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
			comparisons: `<svg ${attrs}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
			audit: `<svg ${attrs}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
			settings: `<svg ${attrs}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
		};
		return icons[key] ?? '';
	}
</script>
