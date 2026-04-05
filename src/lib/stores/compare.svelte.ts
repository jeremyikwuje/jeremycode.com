import type { Tool } from '$lib/types/index.js';

/**
 * Holds up to two tools selected for side-by-side comparison.
 * When two tools are selected, the user is prompted to navigate to
 * /compare/[tool-a-slug]-vs-[tool-b-slug].
 */
class CompareStore {
	toolA: Tool | null = $state(null);
	toolB: Tool | null = $state(null);

	get isReady(): boolean {
		return this.toolA !== null && this.toolB !== null;
	}

	get compareSlug(): string | null {
		if (!this.isReady) return null;
		return `${this.toolA!.slug}-vs-${this.toolB!.slug}`;
	}

	select(tool: Tool): void {
		if (this.toolA?.id === tool.id || this.toolB?.id === tool.id) return;
		if (!this.toolA) {
			this.toolA = tool;
		} else {
			this.toolB = tool;
		}
	}

	deselect(toolId: string): void {
		if (this.toolA?.id === toolId) this.toolA = null;
		else if (this.toolB?.id === toolId) this.toolB = null;
	}

	isSelected(toolId: string): boolean {
		return this.toolA?.id === toolId || this.toolB?.id === toolId;
	}

	clear(): void {
		this.toolA = null;
		this.toolB = null;
	}
}

export const compareStore = new CompareStore();
