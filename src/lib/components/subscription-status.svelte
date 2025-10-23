<script lang="ts">
	import {
		getNextBillingDate,
		intervalToString,
		type Subscription
	} from '$lib/subscriptions.svelte';
	import { formatCurrency, currencyStore } from '$lib/currencies.svelte';
	import Button from './ui/button/button.svelte';

	let {
		brandColor,
		onRemove,
		subscription
	}: { brandColor?: string; onRemove?: () => void; subscription: Subscription } = $props();

	// Calculate the next billing date that is after today
	const nextBillingDate = $derived.by(() => {
		return getNextBillingDate(subscription.startDate, subscription.interval);
	});

	let priceStr = formatCurrency(subscription.price, currencyStore.selected.current);
</script>

<div
	class="group flex h-(--height-status) items-center gap-2 rounded-md border px-4 py-2 shadow-sm"
	style:background-color={brandColor}
	style:border-color={brandColor}
>
	<p class="w-[10ch] border-r pr-4 text-lg">{subscription.service}</p>
	<div class="mx-2">
		<div class="font-medium">{priceStr}</div>
		<div class="text-sm text-muted-foreground">per {intervalToString(subscription.interval)}</div>
	</div>
	<div class="ml-auto flex flex-col text-sm">
		<div>
			Start Date: {subscription.startDate.toLocaleDateString()}
		</div>
		<div>
			Next Billing Date:
			{nextBillingDate.toLocaleDateString()}
		</div>
	</div>
	<div>
		<Button variant="ghost" size="icon" class="invisible group-hover:visible" onclick={onRemove}>
			<span class="sr-only">Remove Subscription</span>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg
			>
		</Button>
	</div>
</div>
