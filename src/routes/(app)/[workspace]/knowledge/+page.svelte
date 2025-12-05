<script lang="ts">
	import Files from '$components/knowledge/files.svelte';
	import Folders from '$components/knowledge/folders.svelte';
	import * as Sidebar from '$components/ui/sidebar/index.js';
	import { Separator } from '$components/ui/separator/index.js';
	import * as Breadcrumb from '$components/ui/breadcrumb/index.js';

    let { params } = $props();

    $inspect(params);
</script>


<div class="h-full px-5 py-4">
	<Files />
	<Folders />
</div>
