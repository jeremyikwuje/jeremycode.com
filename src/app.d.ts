import type { AdminUser } from '$lib/types/admin.js';

declare global {
	namespace App {
		interface Locals {
			/** Populated by hooks.server.ts for /backoffice routes when a valid JWT exists. */
			adminUser: AdminUser | null;
		}
	}
}

export {};
