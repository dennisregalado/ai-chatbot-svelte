<script lang="ts">
	import { login, type LoginActionState } from '../data.remote';
</script>

<form {...login}>
	<input type="email" name="email" />
	<input type="password" name="password" />
	<button type="submit">Login</button>
</form>
