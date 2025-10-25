<script lang="ts">
	import '../app.css';
	import '@fontsource-variable/geist';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext } from 'svelte';
	import { subscriptionCtxKey, SubscriptionStore } from '$lib/subscriptions.svelte';
	import { Settings2 } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { MigrationError } from '$lib/persistence';

	let { children } = $props();

	const subscriptionStore = new SubscriptionStore();

	setContext(subscriptionCtxKey, subscriptionStore);

	let errorReset = $state<() => void>(() => {});
	let errorType = $state<'migration' | 'unexpected' | null>(null);
	let errorMessage = $state<string | null>(null);

	const handleError = (error: unknown, reset: () => void) => {
		errorReset = reset;
		if (error instanceof MigrationError) {
			console.error('Migration error:', error);
			errorType = 'migration';
			errorMessage = error.message;
		}
	};
</script>

<svelte:head>
	<title>SubSheet</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet header()}
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
{/snippet}

<svelte:boundary onerror={handleError}>
	{#snippet failed()}
		{@render header()}
		<main class="mx-auto min-h-(--height-body) max-w-screen-lg border-x border-dashed p-4">
			<h1 class="text-xl">Error Occurred</h1>
			<p>Cause: {errorMessage}</p>
			<button onclick={errorReset}> Try Again </button>
		</main>
	{/snippet}

	<div class="w-full border-b border-dashed">
		{@render header()}

		<main class="mx-auto min-h-(--height-body) max-w-screen-lg border-x border-dashed p-4">
			{@render children?.()}
		</main>
	</div>
</svelte:boundary>
