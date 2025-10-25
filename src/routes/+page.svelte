<script lang="ts">
	import { browser } from '$app/environment';
	import CostTotal from '$lib/components/cost-total.svelte';
	import CustomSub from '$lib/components/custom-sub.svelte';
	import Plan from '$lib/components/plan.svelte';
	import SubscriptionSection from '$lib/components/subscription-section.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { currencyStore, formatCurrency } from '$lib/currencies.svelte';
	import { MigrationError } from '$lib/persistence';
	import { importServices, type Service } from '$lib/services';
	import { differenceInDays, getSubscriptionContext } from '$lib/subscriptions.svelte';
	import { getLocalTimeZone } from '@internationalized/date';

	let searchTerm = $state('');
	let period = $state<'month' | 'year'>('month');
	let services = $state<Record<string, Service>>({});
	let filteredServices = $derived.by(() => {
		if (!searchTerm) return services;

		const lowerSearch = searchTerm.toLowerCase();
		const result: Record<string, Service> = {};

		for (const [name, service] of Object.entries(services)) {
			if (name.toLowerCase().includes(lowerSearch)) {
				result[name] = service;
				continue;
			}

			const matchingPlans = service.plans.filter((plan) =>
				plan.name.toLowerCase().includes(lowerSearch)
			);

			if (matchingPlans.length > 0) {
				result[name] = { ...service, plans: matchingPlans };
			}
		}

		return result;
	});

	const subStore = getSubscriptionContext();

	let subscriptionCount = $derived.by(() => Object.keys(subStore.subscriptions).length);
	let totalCost = $derived.by(() =>
		period === 'month' ? subStore.totalCostPerMonth : subStore.totalCostPerYear
	);

	const loadServices = async () => {
		services = await importServices();
	};

	$effect(() => {
		const start = performance.now();
		loadServices().then(() => {
			console.log('Services loaded');

			const end = performance.now();
			console.log(`Loading services took ${end - start} ms`);
		});
	});

	const dateDiff = $derived.by(() => {
		if (!browser || !subStore.soonestSubscription) return 0;

		const today = new Date();
		const nextDate = subStore.soonestSubscription.nextDate;
		return differenceInDays(today, nextDate);
	});
</script>

<div class="flex gap-2">
	<Button variant="ghost" onclick={() => (period = 'month')}>Monthly</Button>
	<Button variant="ghost" onclick={() => (period = 'year')}>Yearly</Button>
</div>

<div class="mb-10 grid grid-cols-2 items-end justify-items-center gap-y-4 md:grid-cols-3">
	<CostTotal total={totalCost} {period} />
	<div class="w-full border-l border-dashed text-center text-[1.3rem] md:border-x md:text-[2rem]">
		{subscriptionCount} Subscriptions
	</div>
	<!-- Causes an error during ssr -->
	{#if browser && subStore.soonestSubscription}
		<div
			class="col-span-2 w-full border-t border-dashed pt-4 text-center text-lg md:col-span-1 md:border-none md:p-0"
		>
			<div class="text-lg font-medium">
				{subStore.soonestSubscription.subscription.service} - {formatCurrency(
					subStore.soonestSubscription.subscription.price,
					currencyStore.selected.current
				)}
			</div>
			<div class="text-sm text-muted-foreground">in {dateDiff} days</div>
		</div>
	{:else}
		<div
			class="col-span-2 w-full border-t border-dashed pt-4 text-center text-lg md:col-span-1 md:border-none md:p-0"
		>
			No upcoming subscriptions
		</div>
	{/if}
</div>

<section class="mb-8">
	<div class="mb-4 flex items-center justify-between">
		<h2 class="text-xl">Your Subscriptions</h2>
		<CustomSub onadd={(sub) => subStore.addSubscription(sub)} />
	</div>
	<SubscriptionSection
		subscriptions={subStore.subscriptions}
		onremove={(service) => subStore.removeSubscription(service)}
	/>
</section>

<section>
	<div class="flex items-start justify-between">
		<h2 class="text-xl">Services</h2>

		<Input placeholder="Search services..." class="max-w-[300px]" bind:value={searchTerm} />
	</div>
</section>

{#each Object.entries(filteredServices) as [name, service] (name)}
	<div class="mb-8">
		<h3 class="mb-4">{name}</h3>

		<!-- <PlanTable plans={service.plans} /> -->
		<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
			{#each service.plans as plan (plan.name)}
				<Plan
					service={name}
					onadd={(plan, startDate) =>
						subStore.addSubscription({
							interval: plan.interval,
							plan: plan.name,
							price: plan.price,
							service: name,
							startDate: startDate.toDate(getLocalTimeZone())
						})}
					{plan}
				/>
			{/each}
		</div>
	</div>
{/each}
