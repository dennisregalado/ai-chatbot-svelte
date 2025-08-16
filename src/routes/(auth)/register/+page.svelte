<script lang="ts">
	import { register, type RegisterActionState } from '../data.remote';
</script>

<form {...register}>
	<input type="email" name="email" />
	<input type="password" name="password" />
	<button type="submit">Register</button>
</form>
