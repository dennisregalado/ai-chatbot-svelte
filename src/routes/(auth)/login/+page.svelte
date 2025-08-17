<script lang="ts">
	import { signInEmail } from '$remote/auth.remote';
</script>

<form {...signInEmail}>
	<input type="email" name="email" />
	<input type="password" name="password" />
	<button type="submit">Login</button>
</form>
