<script lang="ts">
	import * as UnderlineTabs from '$lib/components/ui/underline-tabs';
	import XIcon from '@lucide/svelte/icons/x';
	import type { Component } from 'svelte';
	import { getBrowserTabs } from '$remote/browser.remote';
	import { page } from '$app/state';

	type BrowserTab = {
		label: string;
		pathname: string;
	};

	const tabs: BrowserTab[] = $derived(await getBrowserTabs());

	$inspect(page.url.pathname, page.params.workspace + tabs[0].pathname);
</script>

<UnderlineTabs.Root value={'/' + page.params.workspace + page.url.pathname}>
	<UnderlineTabs.List>
		{#each tabs as tab}
			<UnderlineTabs.Trigger value={'/' + page.params.workspace + tab.pathname}>
				{tab.label}
			</UnderlineTabs.Trigger>
		{/each}
	</UnderlineTabs.List>
</UnderlineTabs.Root>
