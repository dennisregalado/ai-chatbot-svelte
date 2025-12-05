<script lang="ts">
	let { params } = $props();

	$inspect(params);
</script>

<div>
	<h1>{params.path}</h1>
</div>
