<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index';
	import * as Field from '$lib/components/ui/field/index';
	import { Plus } from '@lucide/svelte';
	import Button from './ui/button/button.svelte';
	import Input from './ui/input/input.svelte';
	import { subscriptionSchema, type Subscription } from '$lib/subscriptions.svelte';
	import { flatten, safeParse } from 'valibot';
	import { getLocalTimeZone, parseDate, today } from '@internationalized/date';

	let { onadd }: { onadd?: (sub: Subscription) => void } = $props();

	type Issues = ReturnType<typeof flatten<typeof subscriptionSchema>>;

	let open = $state(false);

	let issues = $state<Issues | null>(null);

	const onsubmit = (
		event: SubmitEvent & {
			currentTarget: EventTarget & HTMLFormElement;
		}
	) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);

		const data = Object.fromEntries(formData.entries());

		const res = safeParse(subscriptionSchema, {
			service: data.name,
			plan: data.plan,
			price: parseFloat(data.price as string),
			startDate: parseDate(data['start-date'] as string).toDate(getLocalTimeZone()),
			interval: {
				weeks: parseInt(data.weeks as string) || 0,
				months: parseInt(data.months as string) || 0,
				years: parseInt(data.years as string) || 0,
				days: 0
			}
		});

		if (res.success) {
			// Handle successful parsing, e.g., add the subscription
			console.log('Parsed subscription:', res.output);
			onadd?.(res.output);
			open = false;
		} else {
			// Handle validation errors
			console.error('Validation errors:', res.issues);
			issues = flatten(res.issues);
		}
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button type="button" {...props}>
				<Plus />
				Custom Subscription</Button
			>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add Custom Subscription</Dialog.Title>
			<Dialog.Description
				>For tracking subscriptions not offered by the included catalog.</Dialog.Description
			>
		</Dialog.Header>

		<form {onsubmit}>
			<Field.Group>
				<Field.Field>
					<Field.Label for="name">Service Name</Field.Label>
					<Input type="text" id="name" name="name" placeholder="Netflix" />
					{#if issues?.nested?.service}
						<Field.Error>{issues.nested.service[0]}</Field.Error>
					{/if}
				</Field.Field>

				<Field.Field>
					<Field.Label for="plan">Plan Name</Field.Label>
					<Input type="text" id="plan" name="plan" placeholder="Standard Plan" />
					{#if issues?.nested?.plan}
						<Field.Error>{issues.nested.plan[0]}</Field.Error>
					{/if}
				</Field.Field>

				<Field.Field>
					<Field.Label for="price">Price</Field.Label>
					<Input type="number" id="price" name="price" placeholder="9.99" step="0.01" />
					{#if issues?.nested?.price}
						<Field.Error>{issues.nested.price[0]}</Field.Error>
					{/if}
				</Field.Field>

				<Field.Field>
					<Field.Label for="start-date">Start Date</Field.Label>
					<Input
						type="date"
						id="start-date"
						name="start-date"
						defaultValue={today(getLocalTimeZone()).toString()}
					/>
					{#if issues?.nested?.startDate}
						<Field.Error>{issues.nested.startDate[0]}</Field.Error>
					{/if}
				</Field.Field>

				<Field.Separator />

				<Field.Set class="flex-row">
					<Field.Legend>Billing Interval</Field.Legend>

					<Field.Field orientation="horizontal">
						<Field.Label for="weeks">Weeks</Field.Label>
						<Input type="number" id="weeks" name="weeks" placeholder="0" />
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Field.Label for="months">Months</Field.Label>
						<Input type="number" id="months" name="months" placeholder="0" />
					</Field.Field>
					<Field.Field orientation="horizontal">
						<Field.Label for="years">Years</Field.Label>
						<Input type="number" id="years" name="years" placeholder="0" />
					</Field.Field>
				</Field.Set>
			</Field.Group>

			{#if issues?.nested?.interval}
				<Field.Error>{issues.nested.interval[0]}</Field.Error>
			{/if}
			<Button type="submit" class="mt-4 w-full">Add Subscription</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
