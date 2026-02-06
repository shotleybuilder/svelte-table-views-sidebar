# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Svelte component library providing a grouped, searchable sidebar for table views. Designed to integrate with `svelte-table-views-tanstack` for view persistence.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production (runs vite build + package)
npm run package  # Create publishable package (svelte-kit sync + svelte-package + publint)
npm run check    # Run svelte-check for type checking
```

## Architecture

This is a SvelteKit library project using `@sveltejs/package` for publishing.

**Library code lives in `src/lib/`:**
- `ViewSidebar.svelte` - Main component with grouped views, search, pinning, and localStorage persistence
- `types.ts` - TypeScript interfaces for SidebarView, ViewGroup, ViewSidebarProps, and event types
- `index.ts` - Public exports (component + types)

**Demo app in `src/routes/`:**
- `+page.svelte` - Example usage for development testing

The component manages its own state (collapsed groups, pinned views) via localStorage using a configurable `storageKey`. It dispatches events (`select`, `pin`, `groupToggle`) rather than mutating props directly.

## Key Types

- `SidebarView` - View item with id, name, groupId, isPinned, isDefault, order
- `ViewGroup` - Group with id, name, isCollapsed, order
- `SidebarState` - Persisted state shape (collapsedGroups, pinnedViews, isDocked, width)

## Styling

The component uses CSS custom properties (e.g., `--sidebar-bg`, `--selected-bg`) for theming. All styles are scoped within the component.
