<script lang="ts">
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import Header from '$components/header.svelte';

	let { children } = $props();
</script>

<div
	class="flex max-h-dvh min-h-dvh w-full flex-col overflow-auto bg-sidebar"
	data-vaul-drawer-wrapper
>
	<Sidebar.Provider open={false} class="max-h-[calc(100dvh-50px)] min-h-[calc(100dvh-50px)]">
		{#snippet header()}
			<Header />
		{/snippet}
		{#snippet inset()}
			<div
				class="group peer hidden text-sidebar-foreground md:block"
				data-slot="sidebar"
				data-state="collapsed"
				data-collapsible="offcanvas"
				data-variant="inset"
				data-side="left"
			></div>
			<Sidebar.Inset>
				{@render children?.()}
			</Sidebar.Inset>
		{/snippet}
	</Sidebar.Provider>
</div>
