<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowLeft } from '@lucide/svelte';
</script>

<div class="mb-4">
	<a href={resolve('/')} class="0 inline-flex items-center text-sm hover:underline">
		<ArrowLeft class="mr-2 inline-block" size={16} />
		Back to App
	</a>
</div>
<h1 class="mb-8 text-2xl font-semibold">Settings</h1>

<div>
	<h2 class="mb-4 text-lg">Currency</h2>
	<h2 class="mb-4 text-lg">Export & Import</h2>
</div>
