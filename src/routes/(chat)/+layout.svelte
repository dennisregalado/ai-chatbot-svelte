<script lang="ts">
	import AppSidebar from '$components/app-sidebar.svelte';
	import * as Breadcrumb from '$components/ui/breadcrumb/index.js';
	import { Separator } from '$components/ui/separator/index.js';
	import * as Sidebar from '$components/ui/sidebar/index.js';

	import DataStreamProvider from '$components/data-stream-provider.svelte';

	let { data, children } = $props();

	let { session, isCollapsed } = $derived(data);
</script>

<DataStreamProvider>
	<script lang="ts">
		import AppSidebar from '$components/app-sidebar.svelte';
		import * as Breadcrumb from '$components/ui/breadcrumb/index.js';
		import { Separator } from '$components/ui/separator/index.js';
		import * as Sidebar from '$components/ui/sidebar/index.js';
	</script>

	<Sidebar.Provider open={!isCollapsed}>
		<AppSidebar user={session?.user} />
		<Sidebar.Inset>
			<header class="flex h-16 shrink-0 items-center gap-2">
				<div class="flex items-center gap-2 px-4">
					<Sidebar.Trigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item class="hidden md:block">
								<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator class="hidden md:block" />
							<Breadcrumb.Item>
								<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>
			</header>
			<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div class="grid auto-rows-min gap-4 md:grid-cols-3">
					<div class="aspect-video rounded-xl bg-muted/50"></div>
					<div class="aspect-video rounded-xl bg-muted/50"></div>
					<div class="aspect-video rounded-xl bg-muted/50"></div>
				</div>
				<div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div>
			</div>
			{@render children?.()}
		</Sidebar.Inset>
	</Sidebar.Provider>
</DataStreamProvider>
