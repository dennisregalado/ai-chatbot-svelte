<script lang="ts">
	import { streamUploadFile } from '$remote/file.remote';
</script>

<form {...streamUploadFile} enctype="multipart/form-data">
	<input {...streamUploadFile.fields.file.as('file')} />
	<button type="submit">Upload</button>
</form>

<p>{streamUploadFile.result?.file}</p>