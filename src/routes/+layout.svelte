<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/geist';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext } from 'svelte';
	import { subscriptionCtxKey, SubscriptionStore } from '$lib/subscriptions.svelte';
	import { Settings2 } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const subscriptionStore = new SubscriptionStore();

	setContext(subscriptionCtxKey, subscriptionStore);
</script>

<svelte:head>
	<title>SubSheet</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="w-full border-b border-dashed">
	<header
		class="mx-auto flex h-(--height-header) max-w-screen-lg items-center justify-between border-x border-dashed p-4"
	>
		<p class="text-lg">SubSheet</p>
		<nav>
			<a href={resolve('/settings')}>
				<span class="sr-only">Settings</span>
				<Settings2 size={18} />
			</a>
		</nav>
	</header>
</div>
<main class="mx-auto min-h-(--height-body) max-w-screen-lg border-x border-dashed p-4">
	{@render children?.()}
</main>
