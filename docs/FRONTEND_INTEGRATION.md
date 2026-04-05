# Fintech Tools Directory — Frontend Integration Guide

API backend for **jeremycode.com**, a curated directory of stablecoin and fintech tools.

**Base URL:** `{API_HOST}/v1`

---

## Table of Contents

1. [Overview & Conventions](#overview--conventions)
2. [Data Model](#data-model)
3. [Public Endpoints](#public-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Authentication](#authentication)
6. [Filtering & Pagination](#filtering--pagination)
7. [Enums & Allowed Values](#enums--allowed-values)
8. [Error Format](#error-format)

---

## Overview & Conventions

- All responses are JSON.
- Public endpoints require **no auth**. Admin endpoints require a JWT Bearer token.
- Successful responses wrap data in `{ data: ... }`. Paginated responses use `{ data: { items, total, page, limit, pages } }`.
- Rich text fields (`description`, expert take `content`) are **Markdown**.
- All IDs are **UUIDv4**.
- Slugs are lowercase alphanumeric + hyphens (`[a-z0-9-]+`).
- Timestamps are ISO 8601 strings.

---

## Data Model

### Entity Relationship Summary

```
Vertical
  ├── has many  → Category
  ├── has many  → AttributeDefinition
  └── has many  → Tool

Category
  └── has many  → Tool

Tool
  ├── has many  → ToolAttribute (dynamic key-value pairs)
  ├── has many  → ExpertTake
  ├── has many  → ToolSdkLanguage
  ├── many-to-many → Tag         (via tool_tags)
  ├── many-to-many → Region      (via tool_regions)
  └── many-to-many → LearnContent (via learn_content_tools)

Expert
  └── has many  → ExpertTake

Comparison
  ├── belongs to → Tool A
  └── belongs to → Tool B
```

### Key Types

```ts
interface Vertical {
  id: string
  name: string
  slug: string                   // unique
  description?: string
  icon?: string
  accentColour?: string          // hex "#RRGGBB"
  displayOrder: number
  isActive: boolean
}

interface Category {
  id: string
  verticalId: string
  name: string
  slug: string                   // unique within vertical
  description?: string
  colorCode?: string             // hex
  displayOrder: number
}

interface Tool {
  id: string
  name: string
  slug: string                   // globally unique
  tagline: string                // max 80 chars
  description: string            // Markdown, 200-5000 chars
  logoUrl?: string
  verticalId: string
  categoryId: string
  hasPublicApi: boolean
  apiType?: ApiType
  hasSandbox?: boolean
  pricingModel?: PricingModel
  docsUrl?: string
  websiteUrl: string
  githubUrl?: string
  openSource?: boolean
  difficultyRating?: Difficulty
  isFeatured: boolean
  featuredOrder?: number
  isPublished: boolean
  dateAdded: string              // ISO 8601
  dateUpdated: string            // ISO 8601

  // Included in detail responses:
  vertical?: { id, name, slug, icon, accentColour }
  category?: { id, name, slug, colorCode }
  attributes?: { attributeKey: string, attributeValue: string }[]
  expertTakes?: ExpertTake[]
  tags?: { id, name, slug }[]
  regions?: { id, name, slug, code }[]
  sdkLanguages?: { language: string }[]
}

interface ToolCard {
  // Subset returned in list endpoints
  id: string
  name: string
  slug: string
  tagline: string
  logoUrl?: string
  hasPublicApi: boolean
  apiType?: ApiType
  pricingModel?: PricingModel
  difficultyRating?: Difficulty
  isFeatured: boolean
  featuredOrder?: number
  isPublished: boolean
  dateAdded: string
  dateUpdated: string
}

interface AttributeDefinition {
  id: string
  verticalId: string
  key: string                    // e.g. "chains", "stablecoins"
  displayName: string            // e.g. "Supported Chains"
  valueType: "multi_select" | "single_select" | "boolean" | "text"
  allowedValues?: string[]       // e.g. ["Ethereum", "Solana", "Base"]
  filterable: boolean
  displayOrder: number
}

interface ExpertTake {
  id: string
  toolId: string
  expertId: string
  content: string                // Markdown, 100-1500 chars
  verified: boolean
  datePublished: string
  dateUpdated: string
  expert?: Expert
}

interface Expert {
  id: string
  name: string
  slug: string
  title?: string
  avatarUrl?: string
  bio?: string
  isDefault: boolean
}

interface Region {
  id: string
  name: string
  slug: string
  code: string                   // e.g. "AF", "GLOBAL"
}

interface Submission {
  id: string
  toolName: string
  verticalId: string
  submitterEmail: string
  submitterName: string
  submissionData: Record<string, unknown>
  status: SubmissionStatus
  adminNotes?: string
  reviewedBy?: string
  linkedToolId?: string
  createdAt: string
  updatedAt: string
}

interface Comparison {
  id: string
  toolAId: string
  toolBId: string
  slug: string                   // "tool-a-vs-tool-b"
  highlights?: Record<string, unknown>
  toolA?: Tool
  toolB?: Tool
}

interface LearnContent {
  id: string
  title: string
  url: string
  sourceType: "substack" | "youtube"
  description?: string
  displayOrder: number
  tools?: { id, name, slug }[]
  verticals?: { id, name, slug }[]
}
```

---

## Public Endpoints

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |

**Response:**
```json
{ "status": "ok", "db": "connected", "timestamp": "2026-04-05T..." }
```

---

### Verticals

| Method | Path | Description |
|--------|------|-------------|
| GET | `/verticals` | List all active verticals |
| GET | `/verticals/:slug` | Get vertical detail with categories, attributes, and featured tools |

**GET /verticals** response:
```json
{
  "data": [
    {
      "id": "...",
      "name": "Stablecoins",
      "slug": "stablecoins",
      "description": "...",
      "icon": "stablecoins",
      "accentColour": "#A259FF",
      "displayOrder": 1,
      "categoryCount": 8
    }
  ]
}
```

**GET /verticals/:slug** response:
```json
{
  "data": {
    "vertical": { ... },
    "categories": [ ... ],
    "attributeDefinitions": [ ... ],
    "featuredTools": [ ... ]
  }
}
```

---

### Tools

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tools` | List tools (paginated, filterable) |
| GET | `/tools/:slug` | Get full tool detail |
| GET | `/tools/export` | Export all published tools (no pagination) |

**GET /tools** — see [Filtering & Pagination](#filtering--pagination) for full query params.

**Response (list):**
```json
{
  "data": {
    "items": [ ToolCard, ... ],
    "total": 42,
    "page": 1,
    "limit": 24,
    "pages": 2
  }
}
```

**GET /tools/:slug** response:
```json
{
  "data": {
    "tool": {
      "id": "...",
      "name": "Bridge",
      "slug": "bridge-xyz",
      "tagline": "Stablecoin payment infrastructure for the internet",
      "description": "Bridge provides a unified API...",
      "websiteUrl": "https://bridge.xyz",
      "hasPublicApi": true,
      "apiType": "REST",
      "hasSandbox": true,
      "pricingModel": "Usage-based",
      "docsUrl": "https://apidocs.bridge.xyz",
      "difficultyRating": "Easy",
      "vertical": { "id": "...", "name": "Stablecoins", "slug": "stablecoins" },
      "category": { "id": "...", "name": "Payments & Payouts", "slug": "payments-payouts" },
      "attributes": [
        { "attributeKey": "chains", "attributeValue": "Ethereum" },
        { "attributeKey": "chains", "attributeValue": "Solana" },
        { "attributeKey": "stablecoins", "attributeValue": "USDC" }
      ],
      "expertTakes": [ ... ],
      "tags": [ ... ],
      "regions": [ { "id": "...", "name": "Global", "slug": "global", "code": "GLOBAL" } ],
      "sdkLanguages": [ { "language": "TypeScript" } ]
    },
    "related": [ ToolCard, ToolCard, ... ]
  }
}
```

Note on `attributes`: These are **dynamic key-value pairs** defined per-vertical. One tool can have multiple rows with the same `attributeKey` (e.g. multiple chains). To render, group by `attributeKey` and cross-reference `AttributeDefinition.displayName` for labels.

---

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List categories, optionally filtered by vertical |

**Query params:** `vertical` (vertical slug) or `vertical_id` (UUID)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "verticalId": "...",
      "name": "Payments & Payouts",
      "slug": "payments-payouts",
      "description": "...",
      "colorCode": "#2563EB",
      "displayOrder": 2,
      "vertical": { "id": "...", "name": "Stablecoins", "slug": "stablecoins" }
    }
  ]
}
```

---

### Attributes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/attributes/:verticalSlug` | Get attribute definitions for a vertical (powers filter UI) |

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "key": "chains",
      "displayName": "Supported Chains",
      "valueType": "multi_select",
      "allowedValues": ["Ethereum", "Solana", "Tron", "Polygon", "Base", "Arbitrum", "Stellar"],
      "filterable": true,
      "displayOrder": 1
    }
  ]
}
```

Use `filterable: true` definitions to build the dynamic filter sidebar. Use `allowedValues` to populate checkbox/dropdown options. Use `key` as the `attr_*` query param key when filtering tools (e.g. `?attr_chains=Ethereum,Solana`).

---

### Regions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/regions` | List all regions with published tool counts |

**Response:**
```json
{
  "data": [
    { "id": "...", "name": "Global", "slug": "global", "code": "GLOBAL", "toolCount": 6 },
    { "id": "...", "name": "North America", "slug": "north-america", "code": "NA", "toolCount": 4 }
  ]
}
```

---

### Learn Content

| Method | Path | Description |
|--------|------|-------------|
| GET | `/learn` | List learning resources, optionally filtered |

**Query params:** `vertical` (vertical slug), `tool` (tool slug)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "Getting Started with USDC on Solana",
      "url": "https://...",
      "sourceType": "youtube",
      "description": "...",
      "displayOrder": 1,
      "tools": [{ "id": "...", "name": "Circle", "slug": "circle" }],
      "verticals": [{ "id": "...", "name": "Stablecoins", "slug": "stablecoins" }]
    }
  ]
}
```

---

### Comparisons

| Method | Path | Description |
|--------|------|-------------|
| GET | `/comparisons/:slug` | Get a tool comparison (slug format: `tool-a-vs-tool-b`) |

**Response:**
```json
{
  "data": {
    "id": "...",
    "slug": "bridge-xyz-vs-circle",
    "highlights": { ... },
    "toolA": { /* tool with vertical, category */ },
    "toolB": { /* tool with vertical, category */ }
  }
}
```

---

### Submissions (Public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/submissions` | Submit a new tool for review |

**Request body:**
```json
{
  "toolName": "Acme Payments",
  "verticalId": "11111111-1111-4111-a111-111111111111",
  "submitterEmail": "you@example.com",
  "submitterName": "Jane Doe",
  "submissionData": {
    "websiteUrl": "https://acme.com",
    "description": "Acme does payments..."
  }
}
```

**Response (201):**
```json
{
  "data": {
    "id": "...",
    "toolName": "Acme Payments",
    "status": "pending",
    ...
  }
}
```

---

## Admin Endpoints

All admin routes are prefixed `/v1/admin` and require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

### Role Hierarchy

| Role | Access |
|------|--------|
| `super_admin` | Full access to all admin endpoints |
| `editor` | Tools, categories, expert takes, submissions |

---

### Auth

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/admin/auth/login` | `{ email, password }` | Returns `{ accessToken, refreshToken, user }` |
| POST | `/admin/auth/refresh` | `{ refreshToken }` | Returns `{ accessToken, refreshToken }` |

**Token TTL:** Access = 1 hour, Refresh = 7 days.

```ts
// JWT payload
interface JwtPayload {
  sub: string      // admin user ID
  email: string
  role: "super_admin" | "editor"
  iat: number
  exp: number
}
```

---

### Admin Verticals (super_admin only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/verticals` | List all verticals (including inactive) |
| POST | `/admin/verticals` | Create vertical |
| PUT | `/admin/verticals/:id` | Update vertical |
| DELETE | `/admin/verticals/:id` | Deactivate vertical (fails if published tools exist) |

**Create/Update body:**
```json
{
  "name": "Stablecoins",
  "slug": "stablecoins",
  "description": "...",
  "icon": "stablecoins",
  "accentColour": "#A259FF",
  "displayOrder": 1,
  "isActive": true
}
```

---

### Admin Categories (editor+)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/categories` | List categories (`?vertical_id=` to filter) |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |

**Create body:**
```json
{
  "verticalId": "...",
  "name": "Payments & Payouts",
  "slug": "payments-payouts",
  "description": "...",
  "colorCode": "#2563EB",
  "displayOrder": 2
}
```

---

### Admin Attributes (super_admin only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/verticals/:verticalId/attributes` | List attribute definitions for a vertical |
| POST | `/admin/verticals/:verticalId/attributes` | Create attribute definition |
| PUT | `/admin/attributes/:id` | Update attribute definition |
| DELETE | `/admin/attributes/:id` | Delete attribute definition |

**Create body:**
```json
{
  "key": "chains",
  "displayName": "Supported Chains",
  "valueType": "multi_select",
  "allowedValues": ["Ethereum", "Solana", "Base"],
  "filterable": true,
  "displayOrder": 1
}
```

---

### Admin Tools (editor+)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/tools` | List all tools including unpublished (`?vertical=`, `?category=`, `?page=`, `?limit=`) |
| GET | `/admin/tools/:id` | Get full tool by ID |
| POST | `/admin/tools` | Create tool |
| PUT | `/admin/tools/:id` | Update tool |
| DELETE | `/admin/tools/:id` | Delete tool |
| PATCH | `/admin/tools/:id/publish` | Publish/unpublish: `{ isPublished: boolean }` |
| PATCH | `/admin/tools/:id/feature` | Feature/unfeature: `{ isFeatured: boolean, featuredOrder?: number }` |

**Create body:**
```json
{
  "name": "Bridge",
  "slug": "bridge-xyz",
  "tagline": "Stablecoin payment infrastructure for the internet",
  "description": "Bridge provides a unified API...",
  "logoUrl": "https://...",
  "verticalId": "...",
  "categoryId": "...",
  "hasPublicApi": true,
  "apiType": "REST",
  "hasSandbox": true,
  "pricingModel": "Usage-based",
  "docsUrl": "https://apidocs.bridge.xyz",
  "websiteUrl": "https://bridge.xyz",
  "githubUrl": null,
  "openSource": false,
  "difficultyRating": "Easy",
  "isFeatured": true,
  "featuredOrder": 1,
  "attributes": [
    { "key": "chains", "value": "Ethereum" },
    { "key": "chains", "value": "Solana" },
    { "key": "stablecoins", "value": "USDC" }
  ]
}
```

**Conditional validation:**
- If `hasPublicApi` is `true`, then `apiType` and `docsUrl` are required.
- `slug` is auto-generated from `name` if not provided.

---

### Admin Experts & Expert Takes

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/admin/experts` | super_admin | List all experts |
| POST | `/admin/experts` | super_admin | Create expert |
| PUT | `/admin/experts/:id` | super_admin | Update expert |
| GET | `/admin/expert-takes` | editor+ | List all expert takes |
| POST | `/admin/expert-takes` | editor+ | Create expert take (unique per tool+expert) |
| PUT | `/admin/expert-takes/:id` | editor+ | Update expert take |
| DELETE | `/admin/expert-takes/:id` | editor+ | Delete expert take |

**Create expert take body:**
```json
{
  "toolId": "...",
  "expertId": "...",
  "content": "Bridge is the go-to choice if you need...",
  "verified": true
}
```

---

### Admin Submissions (editor+)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/submissions` | List submissions (`?status=`, `?page=`, `?limit=`) |
| GET | `/admin/submissions/:id` | Get submission detail |
| PUT | `/admin/submissions/:id` | Review / update status |

**Review body:**
```json
{
  "status": "approved",
  "adminNotes": "Looks good, creating tool entry.",
  "linkedToolId": "..."
}
```

---

## Filtering & Pagination

**GET /tools** supports the following query parameters:

### Static Filters

| Param | Type | Description |
|-------|------|-------------|
| `vertical` | string | Vertical slug |
| `category` | string | Category slug |
| `region` | string | Region slug |
| `api_type` | enum | `REST`, `GraphQL`, `SDK-only`, `None` |
| `pricing` | enum | `Free`, `Freemium`, `Usage-based`, `Enterprise` |
| `difficulty` | enum | `Easy`, `Medium`, `Complex` |
| `has_public_api` | `"true"` / `"false"` | Filter by API availability |
| `open_source` | `"true"` / `"false"` | Filter by open-source status |
| `has_sandbox` | `"true"` / `"false"` | Filter by sandbox availability |

### Dynamic Attribute Filters

Use the `attr_` prefix + the attribute definition `key`. Values are comma-separated or repeated params.

```
GET /tools?attr_chains=Ethereum,Solana&attr_stablecoins=USDC

# Equivalent:
GET /tools?attr_chains=Ethereum&attr_chains=Solana&attr_stablecoins=USDC
```

To build the dynamic filter UI:
1. Fetch `GET /attributes/:verticalSlug` to get filterable attribute definitions.
2. For each definition where `filterable: true`, render a filter control using `allowedValues`.
3. When the user selects values, pass them as `attr_{key}=value1,value2`.

### Full-Text Search

| Param | Type | Description |
|-------|------|-------------|
| `search` | string (max 200) | Full-text search across name (weight A), tagline (weight B), description (weight C) |

When `search` is provided and `sort` is not set, results are ordered by relevance. Otherwise:

### Sort & Pagination

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `sort` | enum | `date_updated` | `name`, `date_added`, `date_updated`, `relevance` |
| `order` | enum | `desc` | `asc`, `desc` |
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 24 | Items per page (1-100) |

---

## Enums & Allowed Values

```ts
type ApiType = "REST" | "GraphQL" | "SDK-only" | "None"

type PricingModel = "Free" | "Freemium" | "Usage-based" | "Enterprise"

type Difficulty = "Easy" | "Medium" | "Complex"

type SubmissionStatus = "pending" | "in-review" | "approved" | "rejected" | "changes-requested" | "published"

type AdminRole = "super_admin" | "editor"

type AttributeValueType = "multi_select" | "single_select" | "boolean" | "text"

type LearnContentSource = "substack" | "youtube"
```

---

## Error Format

All errors follow this shape:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Tool not found"
  }
}
```

Common error codes:

| HTTP | Code | Meaning |
|------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body or query param validation failed |
| 401 | `INVALID_TOKEN` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Role not sufficient for this endpoint |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate slug, duplicate expert take, etc. |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Seeded Data Reference

The database comes pre-seeded with the following data for the **Stablecoins** vertical:

### Vertical
- **Stablecoins** (`stablecoins`) — accent: `#A259FF`

### Categories
| Slug | Name |
|------|------|
| `issuance` | Issuance |
| `payments-payouts` | Payments & Payouts |
| `offramp-onramp` | Offramp & Onramp |
| `custody-wallets` | Custody & Wallets |
| `defi-rails` | DeFi Rails |
| `compliance-kyc` | Compliance & KYC |
| `data-analytics` | Data & Analytics |
| `infrastructure-rpc` | Infrastructure & RPC |

### Attribute Definitions (Filterable)
| Key | Display Name | Type | Allowed Values |
|-----|-------------|------|----------------|
| `chains` | Supported Chains | multi_select | Ethereum, Solana, Tron, Polygon, Base, Arbitrum, Stellar |
| `stablecoins` | Supported Stablecoins | multi_select | USDC, USDT, EURC, DAI, PYUSD |

### Regions
| Code | Name |
|------|------|
| AF | Africa |
| SEA | Southeast Asia |
| LATAM | Latin America |
| NA | North America |
| EU | Europe |
| ME | Middle East |
| GLOBAL | Global |

### Tools (9 seeded, all published)
| Name | Slug | Category | Featured |
|------|------|----------|----------|
| Bridge | `bridge-xyz` | Payments & Payouts | Yes (#1) |
| Rain | `rain-xyz` | Payments & Payouts | Yes (#2) |
| Better Money Company | `better-money-company` | Payments & Payouts | No |
| Circle | `circle` | Issuance | Yes (#3) |
| Paxos | `paxos` | Issuance | No |
| Brale | `brale` | Issuance | No |
| MoonPay | `moonpay` | Offramp & Onramp | No |
| Transak | `transak` | Offramp & Onramp | No |
| Fireblocks | `fireblocks` | Custody & Wallets | No |
