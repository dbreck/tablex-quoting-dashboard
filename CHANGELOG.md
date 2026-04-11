# Changelog

All notable changes to this project are documented in this file.

The format loosely follows [Keep a Changelog](https://keepachangelog.com/) and this
project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-04-11

First tagged release. Consolidates the entire build of the TableX Quoting Dashboard
from initial analytics spike through Phase 1 acceptance and the Phase 2 proposal
work that's currently with the client.

### Features

**Phase 1 foundation**
- Complete TableX quoting analytics dashboard with CPQ exploration
- Customer Journey map, Quote Builder, and How Quoting Works walkthrough
- Workflow Analysis and CPQ Gap Analysis dashboards
- SKU compatibility matrix extraction from 6,098 SKUs
- WordPress Site Audit and site intelligence enrichment
- User Personas page and dashboard restructure into grouped sections

**CRM & data**
- CRM module with Organizations, Contacts, and Activity tracking
- Historical data pipeline — quotes, orders, invoices, CRM seeding
- Configurator → quote request pipeline
- Gravity Forms web form data in queue analytics (inbound + product mix tabs)

**Spec Studio / 3D configurator**
- React Three Fiber viewer with DWG conversion pipeline
- 2,920 GLB models across 11 series (Ultra, Foundation, Fundamental, and 8 more)
- Supplier base models with composite 3D preview and availability indicators
- PBR rendering with environment lighting, UV generation, and texture preloading
- Lighting presets, edge type swapping, material and color controls

**Authentication & admin**
- Supabase auth with RLS and database migrations
- User profile page and admin user management
- Role selector, optional invite checkbox, and admin-set password flow
- Invite and password reset emails via Supabase

**Client pitch & collaboration**
- 10-slide dark-themed presentation overlay at `/present` with live app demos
- Page commenting system with markers, sidebar, and threaded replies
- Interactive Action Plan tab with checkboxes and decision selection

**Phase 2 Proposal section**
- Scope, Timeline, Estimate, and Infrastructure pages at `/proposal`
- Per-user Estimate and Proposal access control
- Estimate Review page with annotated scope changes
- Infrastructure & Costs page with CMS comparison and competitive alternatives
- Final Stack / Research Notes / Setup Tracker split views
- Setup Tracker with per-service checklists, ownership, handoff plan, and
  LastPass references
- Site Architecture page with 3-draft comparison system and Spec Studio /
  Collections split
- 3-track UI/UX Design split (Style Guide, Web Features, 3D Design)

### Fixes

- Queue page pagination (was capped at 1,000 of 3,595 rows due to Supabase limit)
- Comment badge persistence across page navigations
- Configurator crash when base not set, plus error boundary
- Configurator series list (Ultra added, Fundamental naming corrected)
- Material swapping (vertex colors, invalidation, series filters)
- 3D viewer rendering (black viewer fallback, table floor alignment, leg clipping)
- Invite and password reset flow with auth callback and set-password page
- Users page crash (API return shape)
- SKU parser for SP- prefix and expanded format variations

### Changes

- Renamed "Configure Table" to "Spec Studio" throughout
- Removed JSI competitor references from infrastructure visual breakdown
- Reorganized sidebar nav, corrected queue chart accuracy, updated CPQ action items
- Consolidated 3D viewer camera framing, lighting, and exposure tuning across
  multiple iterations
- Temporarily disabled auth redirect for public demo access
- Added `.npmrc` for legacy-peer-deps on Vercel builds
