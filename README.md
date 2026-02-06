# svelte-table-views-sidebar

A Svelte component library for displaying grouped, searchable view lists in a sidebar. Designed to work with `svelte-table-views-tanstack` for view persistence.

## Installation

```bash
npm install svelte-table-views-sidebar
```

## Peer Dependencies

- `svelte` (^4.0.0)
- `svelte-table-views-tanstack` (optional, for view persistence)

## Usage

### Basic Usage

```svelte
<script lang="ts">
  import { ViewSidebar } from 'svelte-table-views-sidebar';
  import type { SidebarView, ViewGroup } from 'svelte-table-views-sidebar';

  const groups: ViewGroup[] = [
    { id: 'recent', name: 'Recent', order: 0 },
    { id: 'by-status', name: 'By Status', order: 1 },
    { id: 'by-type', name: 'By Type', order: 2 }
  ];

  const views: SidebarView[] = [
    { id: 'recent-laws', name: 'Recent Laws', groupId: 'recent', isDefault: true },
    { id: 'last-month', name: 'Last Month', groupId: 'recent' },
    { id: 'live', name: 'Live Laws', groupId: 'by-status' },
    { id: 'revoked', name: 'Revoked', groupId: 'by-status' },
    { id: 'acts', name: 'Acts', groupId: 'by-type' },
    { id: 'regulations', name: 'Regulations', groupId: 'by-type' }
  ];

  let selectedViewId = 'recent-laws';

  function handleSelect(event: CustomEvent<{ view: SidebarView }>) {
    selectedViewId = event.detail.view.id;
    // Apply view configuration...
  }
</script>

<div class="app-layout">
  <ViewSidebar
    {views}
    {groups}
    {selectedViewId}
    storageKey="my-app-sidebar"
    on:select={handleSelect}
  />
  <main>
    <!-- Your table content -->
  </main>
</div>

<style>
  .app-layout {
    display: flex;
    height: 100vh;
  }
</style>
```

### With svelte-table-views-tanstack

```svelte
<script lang="ts">
  import { ViewSidebar } from 'svelte-table-views-sidebar';
  import { viewsStore, selectView, type View } from 'svelte-table-views-tanstack';
  import type { SidebarView, ViewGroup } from 'svelte-table-views-sidebar';

  // Convert tanstack views to sidebar views
  $: sidebarViews = $viewsStore.views.map(v => ({
    id: v.id,
    name: v.name,
    description: v.description,
    groupId: v.groupId,
    isDefault: v.isDefault
  }));

  $: selectedViewId = $viewsStore.selectedViewId;

  function handleSelect(event: CustomEvent<{ view: SidebarView }>) {
    selectView(event.detail.view.id);
  }
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `views` | `SidebarView[]` | `[]` | Array of views to display |
| `groups` | `ViewGroup[]` | `[]` | Array of groups for organizing views |
| `selectedViewId` | `string` | `undefined` | Currently selected view ID |
| `storageKey` | `string` | `'view-sidebar-state'` | localStorage key for persisting state |
| `isDocked` | `boolean` | `true` | Whether sidebar is visible |
| `width` | `number` | `240` | Sidebar width in pixels |
| `showSearch` | `boolean` | `true` | Show search input |
| `showPinned` | `boolean` | `true` | Show pinned views section |
| `searchPlaceholder` | `string` | `'Search views...'` | Search input placeholder |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `select` | `{ view: SidebarView }` | Fired when a view is selected |
| `pin` | `{ view: SidebarView, isPinned: boolean }` | Fired when a view is pinned/unpinned |
| `groupToggle` | `{ group: ViewGroup, isCollapsed: boolean }` | Fired when a group is expanded/collapsed |

## Types

```typescript
interface SidebarView {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  groupId?: string;
  isPinned?: boolean;
  isDefault?: boolean;
  order?: number;
}

interface ViewGroup {
  id: string;
  name: string;
  icon?: string;
  isCollapsed?: boolean;
  order?: number;
}
```

## CSS Custom Properties

Style the sidebar using CSS custom properties:

```css
:root {
  --sidebar-bg: #f8f9fa;
  --sidebar-border: #e1e4e8;
  --sidebar-font: system-ui, -apple-system, sans-serif;
  --input-border: #d1d5db;
  --input-bg: white;
  --focus-color: #3b82f6;
  --focus-ring: rgba(59, 130, 246, 0.2);
  --text-primary: #1f2937;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --hover-bg: rgba(0, 0, 0, 0.04);
  --selected-bg: rgba(59, 130, 246, 0.1);
  --selected-text: #1d4ed8;
  --pin-color: #f59e0b;
  --badge-bg: #e5e7eb;
  --badge-text: #6b7280;
  --scrollbar-thumb: #d1d5db;
  --scrollbar-thumb-hover: #9ca3af;
}
```

## Features

- **Grouped views**: Organize views into collapsible groups
- **Search**: Filter views by name or description
- **Pinned views**: Pin frequently used views to the top
- **Persistence**: Sidebar state (collapsed groups, pins) saved to localStorage
- **Keyboard accessible**: Full keyboard navigation support
- **Themeable**: Customize appearance with CSS custom properties

## License

MIT
