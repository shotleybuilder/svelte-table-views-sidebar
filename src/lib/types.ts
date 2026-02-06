/**
 * Extended view type for sidebar display
 * Extends the base View from svelte-table-views-tanstack
 */
export interface SidebarView {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	groupId?: string;
	isPinned?: boolean;
	isDefault?: boolean;
	order?: number;
}

/**
 * View group for organizing views in the sidebar
 */
export interface ViewGroup {
	id: string;
	name: string;
	icon?: string;
	isCollapsed?: boolean;
	order?: number;
}

/**
 * Props for the ViewSidebar component
 */
export interface ViewSidebarProps {
	views: SidebarView[];
	groups: ViewGroup[];
	selectedViewId?: string;
	storageKey?: string;
	isDocked?: boolean;
	width?: number;
	showSearch?: boolean;
	showPinned?: boolean;
	searchPlaceholder?: string;
}

/**
 * Event detail for view selection
 */
export interface ViewSelectEvent {
	view: SidebarView;
}

/**
 * Event detail for view pin/unpin
 */
export interface ViewPinEvent {
	view: SidebarView;
	isPinned: boolean;
}

/**
 * Event detail for group collapse/expand
 */
export interface GroupToggleEvent {
	group: ViewGroup;
	isCollapsed: boolean;
}

/**
 * Event detail for view reorder (drag and drop)
 */
export interface ViewReorderEvent {
	view: SidebarView;
	fromGroupId?: string;
	toGroupId?: string;
	newOrder: number;
}

/**
 * Event detail for group reorder
 */
export interface GroupReorderEvent {
	group: ViewGroup;
	newOrder: number;
}

/**
 * Sidebar state persisted to localStorage
 */
export interface SidebarState {
	collapsedGroups: string[];
	pinnedViews: string[];
	isDocked: boolean;
	width: number;
}
