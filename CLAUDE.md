# CLAUDE.md

## Project: jeremy-code-website
SvelteKit application hosting BOTH the public frontend (jeremycode.com) 
and the admin backoffice (under /admin route prefix). Based on 
TDD1-Frontend-FintechToolsDirectory.docx and TDD3-AdminBackoffice-FintechToolsDirectory.docx
in the project root.

## Stack
- SvelteKit (latest), TypeScript strict mode
- Tailwind CSS (dark-mode-first)
- Custom Svelte components only — NO React, NO shadcn/ui, NO component libraries
- Fuse.js for V1 client-side search
- TipTap for admin rich text editing
- svelte-dnd-action for admin drag-and-drop

## Critical architectural rules

### Multi-vertical, data-driven
- Verticals, categories, and attribute definitions are data, NOT hardcoded
- The /[vertical] and /[vertical]/[category] routes are dynamic params
- When a new vertical is added via admin, its pages appear automatically
- FilterPanel dynamically renders filter controls based on the selected 
  vertical's attribute definitions fetched from the API

### Expert takes (NOT "Jeremy's Take")
- Expert opinions are a separate model with multi-author support from day one
- A tool can have zero, one, or many ExpertTake cards
- Each take has an expert reference, content, and a verified flag
- Jeremy is the default expert but the system must support more

### Frontend + Admin sharing
- Both live in the same SvelteKit app, same codebase
- Admin routes under /backoffice prefix, protected via hooks.server.ts
- Shared: TypeScript types (src/lib/types/), Tailwind config, 
  design tokens (CSS custom properties), utility functions
- Admin-specific components in src/lib/components/backoffice/

### Rendering
- SSR for all content-bearing pages via +page.server.ts load functions
- No client-side-only content for anything SEO-critical
- All substantive content must be in the initial HTML response
- Prerendered static only for /about

### SEO and LLM discoverability
- Semantic HTML everywhere (article, nav, main, aside, section)
- JSON-LD structured data (SoftwareApplication, ItemList, WebSite)
- llms.txt and llms-full.txt in static/
- robots.txt allowing GPTBot, ClaudeBot, PerplexityBot, etc.
- Dynamic sitemap.xml via SvelteKit endpoint

### API integration
- Backend API lives at https://tool-api.jeremycode.com (Railway). Base URL from env var API_BASE_URL
- API paths start with /v1 (e.g. /v1/tools, /v1/admin/verticals) — no /api prefix
- All data fetched in +page.server.ts load functions, never client-side
- Admin auth via JWT in HTTP-only secure cookie, validated in hooks.server.ts

## Design philosophy
Blend of Product Hunt (content-forward, warm, discoverable) and 
Vercel (dark elegance, depth through surfaces, minimal chrome).

KEY RULES:
- NO visible borders on cards or containers by default
- Depth comes from background shade shifts, NOT drawn lines
- Cards reveal themselves on hover (background shift + faint border fade-in + soft shadow)
- Typography and whitespace create structure, not boxes
- The design should feel like surfaces floating in dark space, 
  not cells in a wireframe grid
- NO card hover transforms (no scale, no translateY)
- NO white (#FFFFFF) anywhere — warmest text color is #FAFAFA
- Inputs and form fields are the ONLY elements with visible 
  borders at rest (and even those use rgba(255,255,255,0.06))
- Dividers use rgba(255,255,255,0.04) — barely visible, 
  just enough to hint at structure

## Design tokens

### Surfaces (depth through shade, not borders)
- --color-bg: #09090B              (zinc-950, slightly warm black)
- --color-surface-1: #0F0F12       (cards, barely lifted off background)  
- --color-surface-2: #16161A       (elevated panels, modals, hover cards)
- --color-surface-3: #1C1C22       (active states, selected items)

### NO visible borders by default
- --color-border-subtle: rgba(255, 255, 255, 0.04)   (nearly invisible, only for inputs/dividers)
- --color-border-hover: rgba(255, 255, 255, 0.08)     (appears on card hover)
- DO NOT use solid colored borders on cards or containers

### Accent (unchanged)
- --color-primary: #A259FF
- --color-secondary: #4F8EF7
- --color-accent-green: #00FF94

### Text (warmer, more contrast range)
- --color-text: #FAFAFA             (primary — almost white, not gray)
- --color-text-secondary: #A1A1AA   (zinc-400, secondary text)
- --color-text-tertiary: #71717A    (zinc-500, metadata, timestamps)

### Card treatment
- Cards: NO border by default. Background --color-surface-1.
- Cards on hover: background shifts to --color-surface-2, 
  border fades in at rgba(255,255,255,0.06), 
  subtle box-shadow: 0 0 0 1px rgba(255,255,255,0.03), 
  0 4px 12px rgba(0,0,0,0.4)
- Transitions: background 200ms ease, border-color 200ms ease, 
  box-shadow 200ms ease
- NO card hover transforms (no scale, no translateY — 
  that's Dribbble energy, not Vercel)

### Elevation system (replaces border-based separation)
- Level 0: --color-bg (page)
- Level 1: --color-surface-1 (cards, list items)
- Level 2: --color-surface-2 (dropdowns, popovers, hover states)
- Level 3: --color-surface-3 (modals, command palette)
- Each level is visually distinct without borders

### Subtle background texture
- Page background: radial gradient from #0F0F12 center to 
  #09090B edges — creates subtle depth
- OR very fine noise texture at 2-3% opacity

## Typography
- Display: DM Sans
- Body: IBM Plex Sans
- Code: JetBrains Mono

## Spacing: 8px base (4, 8, 12, 16, 24, 32, 48, 64)
## Border radius: cards 8px, badges 4px, buttons/inputs 6px
## Transitions: 150ms ease (hover), 200ms ease-out (reveals). No bounces.

## What NOT to do
- Do NOT create React components or use React patterns
- Do NOT install shadcn/ui or any pre-built component library
- Do NOT hardcode vertical names or attribute keys anywhere
- Do NOT fetch data in client-side Svelte components for SEO-critical content
- Do NOT create a separate admin project — keep it in /backoffice prefix
- Do NOT add third-party scripts (V1 is zero-third-party)