<script lang="ts">
	import { ViewSidebar } from '$lib';
	import type { SidebarView, ViewGroup } from '$lib';

	const groups: ViewGroup[] = [
		{ id: 'recent', name: 'Recent', order: 0 },
		{ id: 'by-status', name: 'By Status', order: 1 }
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

<div class="demo">
	<ViewSidebar {views} {groups} {selectedViewId} on:select={handleSelect} />
	<main>
		<h1>ViewSidebar Demo</h1>
		<p>Selected: {selectedViewId}</p>
	</main>
</div>

<style>
	.demo {
		display: flex;
		height: 100vh;
	}
	main {
		flex: 1;
		padding: 20px;
	}
</style>
