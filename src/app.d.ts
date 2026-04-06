import type { AdminUser } from '$lib/types/admin.js';

declare global {
	namespace App {
		interface Locals {
			/** Populated by hooks.server.ts for /backoffice routes when a valid JWT exists. */
			adminUser: AdminUser | null;
		}

		interface Platform {
			env?: {
				API_BASE_URL?: string;
			};
		}
	}
}

export {};
