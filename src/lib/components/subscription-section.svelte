<script lang="ts">
	import { getNextBillingDate, type Subscription } from '$lib/subscriptions.svelte';
	import { ChevronDown, X } from '@lucide/svelte';
	import { Button } from './ui/button';
	import * as Table from '$lib/components/ui/table/index';
	import { formatPrice } from '$lib/utils';

	let {
		subscriptions,
		onremove
	}: { subscriptions: Record<string, Subscription>; onremove?: (service: string) => void } =
		$props();

	let statusExpanded = $state(false);
	let subscriptionCount = $derived.by(() => Object.keys(subscriptions).length);

	let subData = $derived.by(() => {
		return Object.values(subscriptions).map((sub) => {
			return {
				...sub,
				price: formatPrice(sub.price),
				nextBilling: getNextBillingDate(sub.startDate, sub.interval).toLocaleDateString()
			};
		});
	});
</script>

<div
	class={[statusExpanded ? '' : 'minimized', 'subs']}
	style={`--sub-count: ${subscriptionCount}`}
>
	<Table.Root>
		<Table.Header class="h-(--height-header)">
			<Table.Row>
				<Table.Head class="w-[200px]">Service</Table.Head>
				<Table.Head class="text-right">Price</Table.Head>
				<Table.Head class="hidden text-right md:block">Start Date</Table.Head>
				<Table.Head class="text-right">Next Billing</Table.Head>
				<Table.Head class="w-[30px]"></Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each subData as subscription ('table' + subscription.service + subscription.plan)}
				<Table.Row>
					<Table.Cell class="w-[200px]">
						<div class="font-semibold">
							{subscription.service}
						</div>
						<div class="text-muted-foreground">
							{subscription.plan}
						</div>
					</Table.Cell>
					<Table.Cell class="text-right">
						{subscription.price}
					</Table.Cell>
					<Table.Cell class="hidden text-right md:block"
						>{subscription.startDate.toLocaleDateString()}</Table.Cell
					>

					<Table.Cell class="text-right">{subscription.nextBilling}</Table.Cell>
					<Table.Cell class="w-[30px]">
						<Button variant="ghost" size="icon" onclick={() => onremove?.(subscription.service)}>
							<X size={14} />
						</Button>
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
</div>
<div class="flex justify-center">
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
		--height-row: 57px;
		--height-header: 40px;
		overflow: hidden;
		transition: max-height 0.2s ease-out;
		max-height: calc(var(--sub-count) * var(--height-row) + var(--height-row));
	}

	.subs.minimized {
		max-height: calc(var(--height-row) * 5 + var(--height-header));
		overflow: hidden;
	}
</style>
