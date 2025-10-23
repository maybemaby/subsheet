<script lang="ts">
	import { currencyStore, formatCurrency } from '$lib/currencies.svelte';
	import { splitText, animate, stagger } from 'animejs';
	import type { Attachment } from 'svelte/attachments';
	let { total, period }: { total: number; period: string } = $props();

	const animateTotal: Attachment = (el) => {
		const { chars } = splitText(el as HTMLElement, {
			chars: {
				wrap: 'clip'
			}
		});

		animate(chars, {
			y: ['-30%', '0%'],
			opacity: [0, 1],
			duration: 500,
			delay: stagger(100),
			ease: 'out'
		});
	};

	const animatePeriod: Attachment = (el) => {
		animate(el as HTMLElement, {
			opacity: [0, 1],
			y: ['50%', '0%'],
			duration: 500,
			ease: 'out'
		});
	};

	const priceStr = $derived(formatCurrency(total, currencyStore.selected.current));
</script>

<div class="flex items-end">
	{#key total}
		<span class="translate-y-1 text-[2rem] lg:translate-y-3 lg:text-[3rem]" {@attach animateTotal}
			>{priceStr}</span
		>
	{/key}
	<span class="ml-2 text-lg">/</span>
	{#key period}
		<span class="ml-2 text-lg" {@attach animatePeriod}>{period}</span>
	{/key}
</div>
