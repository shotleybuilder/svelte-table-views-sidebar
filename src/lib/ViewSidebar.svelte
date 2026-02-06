<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type {
		SidebarView,
		ViewGroup,
		ViewSelectEvent,
		ViewPinEvent,
		GroupToggleEvent,
		SidebarState
	} from './types.js';

	// Props
	export let views: SidebarView[] = [];
	export let groups: ViewGroup[] = [];
	export let selectedViewId: string | undefined = undefined;
	export let storageKey: string = 'view-sidebar-state';
	export let isDocked: boolean = true;
	export let width: number = 240;
	export let showSearch: boolean = true;
	export let showPinned: boolean = true;
	export let searchPlaceholder: string = 'Search views...';

	// Internal state
	let searchQuery = '';
	let collapsedGroups: Set<string> = new Set();
	let pinnedViewIds: Set<string> = new Set();

	const dispatch = createEventDispatcher<{
		select: ViewSelectEvent;
		pin: ViewPinEvent;
		groupToggle: GroupToggleEvent;
	}>();

	// Load persisted state
	onMount(() => {
		if (typeof localStorage !== 'undefined') {
			try {
				const saved = localStorage.getItem(storageKey);
				if (saved) {
					const state: SidebarState = JSON.parse(saved);
					collapsedGroups = new Set(state.collapsedGroups || []);
					pinnedViewIds = new Set(state.pinnedViews || []);
					if (state.isDocked !== undefined) isDocked = state.isDocked;
					if (state.width !== undefined) width = state.width;
				}
			} catch (e) {
				console.warn('Failed to load sidebar state:', e);
			}
		}
	});

	// Persist state on changes
	function saveState() {
		if (typeof localStorage !== 'undefined') {
			const state: SidebarState = {
				collapsedGroups: Array.from(collapsedGroups),
				pinnedViews: Array.from(pinnedViewIds),
				isDocked,
				width
			};
			localStorage.setItem(storageKey, JSON.stringify(state));
		}
	}

	// Filter views by search query
	$: filteredViews = searchQuery
		? views.filter(
				(v) =>
					v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					v.description?.toLowerCase().includes(searchQuery.toLowerCase())
			)
		: views;

	// Get pinned views
	$: pinnedViews = views.filter((v) => v.isPinned || pinnedViewIds.has(v.id));

	// Get views by group
	function getViewsForGroup(groupId: string): SidebarView[] {
		return filteredViews.filter((v) => v.groupId === groupId);
	}

	// Get ungrouped views
	$: ungroupedViews = filteredViews.filter((v) => !v.groupId);

	// Sorted groups
	$: sortedGroups = [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

	// Event handlers
	function handleSelectView(view: SidebarView) {
		dispatch('select', { view });
	}

	function handleTogglePin(view: SidebarView, event: MouseEvent) {
		event.stopPropagation();
		const newPinned = !pinnedViewIds.has(view.id);
		if (newPinned) {
			pinnedViewIds.add(view.id);
		} else {
			pinnedViewIds.delete(view.id);
		}
		pinnedViewIds = pinnedViewIds; // Trigger reactivity
		saveState();
		dispatch('pin', { view, isPinned: newPinned });
	}

	function handleToggleGroup(group: ViewGroup) {
		const newCollapsed = !collapsedGroups.has(group.id);
		if (newCollapsed) {
			collapsedGroups.add(group.id);
		} else {
			collapsedGroups.delete(group.id);
		}
		collapsedGroups = collapsedGroups; // Trigger reactivity
		saveState();
		dispatch('groupToggle', { group, isCollapsed: newCollapsed });
	}

	function isGroupCollapsed(groupId: string): boolean {
		return collapsedGroups.has(groupId);
	}
</script>

{#if isDocked}
	<aside class="view-sidebar" style="width: {width}px;">
		{#if showSearch}
			<div class="sidebar-search">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder={searchPlaceholder}
					class="search-input"
				/>
				{#if searchQuery}
					<button class="clear-search" on:click={() => (searchQuery = '')}>x</button>
				{/if}
			</div>
		{/if}

		<div class="sidebar-content">
			{#if showPinned && pinnedViews.length > 0}
				<div class="pinned-section">
					<div class="section-header">
						<span class="section-icon">*</span>
						<span class="section-title">Pinned</span>
					</div>
					<ul class="view-list">
						{#each pinnedViews as view (view.id)}
							<li class="view-item" class:selected={view.id === selectedViewId}>
								<button class="view-button" on:click={() => handleSelectView(view)}>
									{#if view.icon}
										<span class="view-icon">{view.icon}</span>
									{/if}
									<span class="view-name">{view.name}</span>
								</button>
								<button
									class="pin-button pinned"
									on:click={(e) => handleTogglePin(view, e)}
									title="Unpin view"
								>
									*
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			{#each sortedGroups as group (group.id)}
				{@const groupViews = getViewsForGroup(group.id)}
				{#if groupViews.length > 0 || !searchQuery}
					<div class="view-group">
						<button class="group-header" on:click={() => handleToggleGroup(group)}>
							<span class="collapse-icon" class:collapsed={isGroupCollapsed(group.id)}>v</span>
							{#if group.icon}
								<span class="group-icon">{group.icon}</span>
							{/if}
							<span class="group-name">{group.name}</span>
							<span class="group-count">{groupViews.length}</span>
						</button>
						{#if !isGroupCollapsed(group.id)}
							<ul class="view-list">
								{#each groupViews as view (view.id)}
									<li class="view-item" class:selected={view.id === selectedViewId}>
										<button class="view-button" on:click={() => handleSelectView(view)}>
											{#if view.icon}
												<span class="view-icon">{view.icon}</span>
											{/if}
											<span class="view-name">{view.name}</span>
											{#if view.isDefault}
												<span class="default-badge">Default</span>
											{/if}
										</button>
										<button
											class="pin-button"
											class:pinned={pinnedViewIds.has(view.id)}
											on:click={(e) => handleTogglePin(view, e)}
											title={pinnedViewIds.has(view.id) ? 'Unpin view' : 'Pin view'}
										>
											{pinnedViewIds.has(view.id) ? '*' : 'o'}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			{/each}

			{#if ungroupedViews.length > 0}
				<div class="view-group ungrouped">
					<div class="group-header static">
						<span class="group-name">Other Views</span>
						<span class="group-count">{ungroupedViews.length}</span>
					</div>
					<ul class="view-list">
						{#each ungroupedViews as view (view.id)}
							<li class="view-item" class:selected={view.id === selectedViewId}>
								<button class="view-button" on:click={() => handleSelectView(view)}>
									{#if view.icon}
										<span class="view-icon">{view.icon}</span>
									{/if}
									<span class="view-name">{view.name}</span>
									{#if view.isDefault}
										<span class="default-badge">Default</span>
									{/if}
								</button>
								<button
									class="pin-button"
									class:pinned={pinnedViewIds.has(view.id)}
									on:click={(e) => handleTogglePin(view, e)}
									title={pinnedViewIds.has(view.id) ? 'Unpin view' : 'Pin view'}
								>
									{pinnedViewIds.has(view.id) ? '*' : 'o'}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</aside>
{/if}

<style>
	.view-sidebar {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--sidebar-bg, #f8f9fa);
		border-right: 1px solid var(--sidebar-border, #e1e4e8);
		font-family: var(--sidebar-font, system-ui, -apple-system, sans-serif);
		font-size: 13px;
	}

	.sidebar-search {
		padding: 12px;
		border-bottom: 1px solid var(--sidebar-border, #e1e4e8);
		position: relative;
	}

	.search-input {
		width: 100%;
		padding: 6px 28px 6px 10px;
		border: 1px solid var(--input-border, #d1d5db);
		border-radius: 4px;
		font-size: 12px;
		background: var(--input-bg, white);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--focus-color, #3b82f6);
		box-shadow: 0 0 0 2px var(--focus-ring, rgba(59, 130, 246, 0.2));
	}

	.clear-search {
		position: absolute;
		right: 18px;
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		color: var(--text-muted, #6b7280);
		cursor: pointer;
		font-size: 16px;
		padding: 0 4px;
	}

	.sidebar-content {
		flex: 1;
		overflow-y: auto;
		padding: 8px 0;
	}

	.pinned-section {
		margin-bottom: 8px;
		padding-bottom: 8px;
		border-bottom: 1px solid var(--sidebar-border, #e1e4e8);
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 12px;
		color: var(--text-muted, #6b7280);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.section-icon {
		color: var(--pin-color, #f59e0b);
	}

	.view-group {
		margin-bottom: 4px;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
		padding: 6px 12px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-secondary, #4b5563);
		text-align: left;
	}

	.group-header:hover {
		background: var(--hover-bg, rgba(0, 0, 0, 0.04));
	}

	.group-header.static {
		cursor: default;
	}

	.group-header.static:hover {
		background: none;
	}

	.collapse-icon {
		font-size: 10px;
		transition: transform 0.15s ease;
	}

	.collapse-icon.collapsed {
		transform: rotate(-90deg);
	}

	.group-count {
		margin-left: auto;
		color: var(--text-muted, #9ca3af);
		font-weight: normal;
		font-size: 11px;
	}

	.view-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.view-item {
		display: flex;
		align-items: center;
		padding: 0 8px 0 24px;
	}

	.view-item:hover {
		background: var(--hover-bg, rgba(0, 0, 0, 0.04));
	}

	.view-item.selected {
		background: var(--selected-bg, rgba(59, 130, 246, 0.1));
	}

	.view-button {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 13px;
		color: var(--text-primary, #1f2937);
		text-align: left;
	}

	.view-item.selected .view-button {
		color: var(--selected-text, #1d4ed8);
		font-weight: 500;
	}

	.view-icon {
		font-size: 14px;
	}

	.view-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.default-badge {
		font-size: 9px;
		padding: 1px 4px;
		background: var(--badge-bg, #e5e7eb);
		color: var(--badge-text, #6b7280);
		border-radius: 3px;
		text-transform: uppercase;
		font-weight: 600;
	}

	.pin-button {
		padding: 4px 6px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--text-muted, #9ca3af);
		font-size: 12px;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.view-item:hover .pin-button {
		opacity: 1;
	}

	.pin-button:hover {
		color: var(--pin-color, #f59e0b);
	}

	.pin-button.pinned {
		opacity: 1;
		color: var(--pin-color, #f59e0b);
	}

	/* Scrollbar styling */
	.sidebar-content::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-content::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb, #d1d5db);
		border-radius: 3px;
	}

	.sidebar-content::-webkit-scrollbar-thumb:hover {
		background: var(--scrollbar-thumb-hover, #9ca3af);
	}
</style>
