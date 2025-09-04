<script lang="ts">
	import { getCustomer } from '$remote/customer.remote';
	import { Button } from '$components/ui/button';
	
	const customer = getCustomer();
</script>

<Button variant="outline" size="sm">3.02</Button>
