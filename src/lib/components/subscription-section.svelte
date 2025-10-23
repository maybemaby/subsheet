<script lang="ts">
	import { getSubscriptionContext } from '$lib/subscriptions.svelte';
	import { ChevronDown } from '@lucide/svelte';
	import { Button } from './ui/button';
	import SubscriptionStatus from './subscription-status.svelte';

	let statusExpanded = $state(false);
	let subStore = getSubscriptionContext();
	let subscriptionCount = $derived.by(() => Object.keys(subStore.subscriptions.current).length);
</script>

<div class="flex flex-col" style="--sub-count: {subscriptionCount}">
	<div class={['subs flex flex-col gap-2', !statusExpanded && 'minimized']}>
		{#each Object.values(subStore.subscriptions.current) as subscription ('status' + subscription.service + subscription.plan)}
			<SubscriptionStatus
				{subscription}
				onRemove={() => subStore.removeSubscription(subscription.service)}
			/>
		{/each}
	</div>
	{#if subscriptionCount > 5}
		<Button
			variant="outline"
			size="icon"
			class={['mt-4 self-center rounded-full', statusExpanded && 'rotate-180']}
			onclick={() => (statusExpanded = !statusExpanded)}
		>
			<ChevronDown />
		</Button>
	{/if}
</div>

<style>
	.subs {
		/* For gap-2 tailwind */
		--gap-size: 0.5rem;
		--height-full: calc(var(--height-status) + var(--gap-size));
		overflow: hidden;
		transition: max-height 0.2s ease-out;
		max-height: calc(var(--sub-count) * var(--height-full) + 40px);
	}

	.subs.minimized {
		max-height: calc(var(--height-full) * 5);
		overflow: hidden;
	}
</style>
