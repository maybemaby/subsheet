<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { DateField } from 'bits-ui';
	import type { Plan } from '$lib/services';
	import { intervalToString } from '$lib/subscriptions.svelte';
	import Button from './ui/button/button.svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { cn, formatPrice } from '$lib/utils';

	let {
		plan,
		service,
		onadd
	}: {
		plan: Plan;
		service?: string;
		onadd?: (plan: Plan, startDate: DateValue) => void;
	} = $props();

	let dialogOpen = $state(false);
	let start = $state(today(getLocalTimeZone()));
	const intervalStr = intervalToString(plan.interval);

	const priceStr = formatPrice(plan.price);

	const onSubmit = () => {
		onadd?.(plan, start);

		dialogOpen = false;
	};
</script>

<Card.Root class="rounded-md">
	<Card.Header>
		<Card.Title>{plan.name}</Card.Title>
		<Card.Description class="text-foreground">{priceStr} / {intervalStr}</Card.Description>
	</Card.Header>
	<Card.Footer>
		<Dialog.Root bind:open={dialogOpen}>
			<Dialog.Trigger>
				{#snippet child({ props })}
					<Button type="button" {...props}>Add to Subscription</Button>
				{/snippet}
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>{service} - {plan.name}</Dialog.Title>
					<Dialog.Description class="text-lg text-foreground"
						>{priceStr} / {intervalStr}</Dialog.Description
					>
				</Dialog.Header>

				<DateField.Root placeholder={start} bind:value={start}>
					<div class="flex w-full max-w-[280px] flex-col gap-1.5">
						<DateField.Label>Start Date:</DateField.Label>
						<DateField.Input
							class={cn(
								'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 pt-1.5 text-sm font-medium shadow-xs ring-offset-background transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30',
								'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
								'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
							)}
						>
							{#snippet children({ segments })}
								{#each segments as { part, value }, i (part + i)}
									<div class="inline-block select-none">
										{#if part === 'literal'}
											<DateField.Segment {part} class="p-1 text-muted-foreground">
												{value}
											</DateField.Segment>
										{:else}
											<DateField.Segment
												{part}
												class="rounded-5px px-1 py-1 hover:bg-secondary focus:bg-secondary focus:text-foreground focus-visible:ring-0! focus-visible:ring-offset-0! aria-[valuetext=Empty]:text-muted-foreground data-invalid:text-destructive"
											>
												{value}
											</DateField.Segment>
										{/if}
									</div>
								{/each}
							{/snippet}
						</DateField.Input>
					</div>
				</DateField.Root>
				<Dialog.Footer>
					<Button type="submit" onclick={onSubmit}>Add Plan</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Footer>
</Card.Root>
