<script lang="ts">
	import { signInEmail } from '../data.remote';
</script>

<form {...signInEmail}>
	<input type="email" name="email" />
	<input type="password" name="password" />
	<button type="submit">Login</button>
</form>
