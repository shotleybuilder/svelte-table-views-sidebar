# SKILL: ViewSidebar Component

**Purpose:** Display grouped, searchable view lists in a sidebar with collapsible sections, pinned favorites, and localStorage persistence.

**Context:** Svelte 4/5, TypeScript, svelte-table-views-tanstack (optional peer dependency)

**When to Use:**
- Building a table view selector UI (like Airtable's sidebar)
- Organizing views into logical groups
- Allowing users to pin favorite views
- Persisting sidebar state (collapsed groups, pins) across sessions

---

## Core Principles

1. **Separation of concerns**: This library handles UI only. Use `svelte-table-views-tanstack` for view persistence and state management.
2. **Event-driven**: Component emits events (`select`, `pin`, `groupToggle`) rather than managing view state directly.
3. **Themeable**: All colors and styles use CSS custom properties for easy customization.
4. **Accessible**: Keyboard navigable with proper button semantics.

---

## Common Pitfalls & Solutions

### ❌ Storing view data in the sidebar

```svelte
<!-- WRONG: Sidebar managing view definitions -->
<ViewSidebar bind:views={myViews} />
```

### ✅ Sidebar as presentation layer only

```svelte
<!-- RIGHT: Views come from external store, sidebar just displays -->
<script>
  import { viewsStore } from 'svelte-table-views-tanstack';
  
  $: sidebarViews = $viewsStore.views.map(v => ({
    id: v.id,
    name: v.name,
    groupId: v.groupId,
    isDefault: v.isDefault
  }));
</script>

<ViewSidebar views={sidebarViews} on:select={handleSelect} />
```

---

### ❌ Forgetting to handle the select event

```svelte
<!-- WRONG: No handler, clicking views does nothing -->
<ViewSidebar {views} {groups} />
```

### ✅ Always handle view selection

```svelte
<script>
  function handleSelect(event) {
    const { view } = event.detail;
    selectedViewId = view.id;
    // Apply view configuration to your table...
  }
</script>

<ViewSidebar {views} {groups} {selectedViewId} on:select={handleSelect} />
```

---

### ❌ Duplicate storage keys across instances

```svelte
<!-- WRONG: Two sidebars with default storageKey will conflict -->
<ViewSidebar {views} {groups} />  <!-- Uses 'view-sidebar-state' -->
<ViewSidebar {views} {groups} />  <!-- Also uses 'view-sidebar-state' -->
```

### ✅ Unique storage keys per sidebar

```svelte
<ViewSidebar {views} {groups} storageKey="browse-sidebar" />
<ViewSidebar {views} {groups} storageKey="admin-sidebar" />
```

---

## Working Patterns

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
    { id: 'revoked', name: 'Revoked', groupId: 'by-status' }
  ];

  let selectedViewId = 'recent-laws';

  function handleSelect(event: CustomEvent<{ view: SidebarView }>) {
    selectedViewId = event.detail.view.id;
  }
</script>

<div class="layout">
  <ViewSidebar
    {views}
    {groups}
    {selectedViewId}
    storageKey="my-app-views"
    on:select={handleSelect}
  />
  <main>
    <!-- Table content -->
  </main>
</div>

<style>
  .layout {
    display: flex;
    height: 100vh;
  }
</style>
```

### With svelte-table-views-tanstack

```svelte
<script lang="ts">
  import { ViewSidebar } from 'svelte-table-views-sidebar';
  import { viewsStore, selectView } from 'svelte-table-views-tanstack';
  import type { SidebarView } from 'svelte-table-views-sidebar';

  // Define your groups
  const groups = [
    { id: 'time-based', name: 'Time-Based Views', order: 0 },
    { id: 'by-category', name: 'By Category', order: 1 }
  ];

  // Map tanstack views to sidebar format
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

<ViewSidebar
  views={sidebarViews}
  {groups}
  {selectedViewId}
  on:select={handleSelect}
/>
```

### Custom Theming

```css
/* Dark theme example */
:root {
  --sidebar-bg: #1a1a2e;
  --sidebar-border: #2d2d44;
  --input-bg: #16213e;
  --input-border: #2d2d44;
  --text-primary: #eaeaea;
  --text-secondary: #a0a0a0;
  --text-muted: #6b6b6b;
  --hover-bg: rgba(255, 255, 255, 0.05);
  --selected-bg: rgba(99, 102, 241, 0.2);
  --selected-text: #818cf8;
  --pin-color: #fbbf24;
  --focus-color: #6366f1;
  --focus-ring: rgba(99, 102, 241, 0.3);
}
```

---

## Troubleshooting

### Sidebar state not persisting

**Symptom:** Collapsed groups and pins reset on page reload.

**Cause:** localStorage not available or storageKey conflict.

**Solution:**
1. Check browser dev tools > Application > Local Storage
2. Ensure unique `storageKey` prop for each sidebar instance
3. Verify localStorage isn't blocked by browser settings

### Views not filtering when searching

**Symptom:** Search input doesn't filter the view list.

**Cause:** Views missing `name` or `description` properties.

**Solution:** Ensure all views have at least a `name` property:

```typescript
const views: SidebarView[] = [
  { id: '1', name: 'My View' },  // Works
  { id: '2' }  // Won't appear in search results
];
```

### Groups appearing in wrong order

**Symptom:** Groups not sorted as expected.

**Cause:** Missing `order` property on groups.

**Solution:** Add explicit `order` values:

```typescript
const groups: ViewGroup[] = [
  { id: 'a', name: 'First', order: 0 },
  { id: 'b', name: 'Second', order: 1 },
  { id: 'c', name: 'Third', order: 2 }
];
```

---

## Quick Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `views` | `SidebarView[]` | `[]` | Views to display |
| `groups` | `ViewGroup[]` | `[]` | Groups for organization |
| `selectedViewId` | `string` | `undefined` | Currently selected view |
| `storageKey` | `string` | `'view-sidebar-state'` | localStorage key |
| `isDocked` | `boolean` | `true` | Sidebar visibility |
| `width` | `number` | `240` | Width in pixels |
| `showSearch` | `boolean` | `true` | Show search input |
| `showPinned` | `boolean` | `true` | Show pinned section |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `select` | `{ view: SidebarView }` | View clicked |
| `pin` | `{ view: SidebarView, isPinned: boolean }` | View pinned/unpinned |
| `groupToggle` | `{ group: ViewGroup, isCollapsed: boolean }` | Group expanded/collapsed |

### Types

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

---

## Related Skills

- `svelte-table-views-tanstack` - View persistence and state management
- `svelte-table-kit` - Table component with sorting, filtering, grouping

---

## Key Takeaways

✅ **Do:**
- Use unique `storageKey` for each sidebar instance
- Handle the `select` event to apply view changes
- Define `order` on groups for predictable sorting
- Map external view data to `SidebarView` format

❌ **Don't:**
- Store view definitions in the sidebar component
- Forget to pass `selectedViewId` for visual feedback
- Use default storageKey with multiple sidebars
- Skip the `name` property on views
