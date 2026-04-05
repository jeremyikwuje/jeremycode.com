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

## Design tokens (CSS custom properties)
- --color-bg: #0A0A0A
- --color-surface: #111827
- --color-surface-alt: #1A1A1A
- --color-primary: #A259FF (Solid Purple)
- --color-secondary: #4F8EF7 (Signal Blue)
- --color-accent-green: #00FF94 (YouTube/video only)
- --color-text: #F5F5F5
- --color-text-muted: #9CA3AF
- --color-border: #1F2937

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