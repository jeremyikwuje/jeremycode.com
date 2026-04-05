/**
 * UI state store — controls overlays and drawers.
 * No persistence; resets on page navigation (which is correct behaviour).
 */
class UiStore {
	filterDrawerOpen: boolean = $state(false);
	searchPaletteOpen: boolean = $state(false);
	mobileMenuOpen: boolean = $state(false);

	openFilterDrawer(): void {
		this.filterDrawerOpen = true;
	}

	closeFilterDrawer(): void {
		this.filterDrawerOpen = false;
	}

	toggleFilterDrawer(): void {
		this.filterDrawerOpen = !this.filterDrawerOpen;
	}

	openSearchPalette(): void {
		this.searchPaletteOpen = true;
		// Close other overlays so they don't stack
		this.mobileMenuOpen = false;
	}

	closeSearchPalette(): void {
		this.searchPaletteOpen = false;
	}

	toggleMobileMenu(): void {
		this.mobileMenuOpen = !this.mobileMenuOpen;
	}

	closeMobileMenu(): void {
		this.mobileMenuOpen = false;
	}

	closeAll(): void {
		this.filterDrawerOpen = false;
		this.searchPaletteOpen = false;
		this.mobileMenuOpen = false;
	}
}

export const uiStore = new UiStore();
