<script lang="ts">
	import * as Table from '$lib/components/ui/table/index';
	import { type Plan } from '$lib/services';
	import { intervalToString } from '$lib/subscriptions.svelte';

	let { plans }: { plans: Plan[] } = $props();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Plan Name</Table.Head>
			<Table.Head>Price</Table.Head>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each plans as plan (plan.name)}
			<Table.Row>
				<Table.Head class="w-[200px]">{plan.name}</Table.Head>
				<Table.Head>${plan.price} / {intervalToString(plan.interval)}</Table.Head>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
