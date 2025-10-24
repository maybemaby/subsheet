<script lang="ts">
	import { resolve } from '$app/paths';
	import { ArrowLeft } from '@lucide/svelte';
	import { currencies, currencyStore } from '$lib/currencies.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import {
		getSubscriptionContext,
		importSubscriptionDataSchema,
		type Subscription
	} from '$lib/subscriptions.svelte';
	import { Input } from '$lib/components/ui/input';
	import Label from '$lib/components/ui/label/label.svelte';
	import SubscriptionSection from '$lib/components/subscription-section.svelte';
	import { safeParse } from 'valibot';

	const subStore = getSubscriptionContext();
	let importedData = $state<Record<string, Subscription> | null>(null);
	let importError = $state<string | null>(null);

	function exportData() {
		const data = subStore.subscriptions.current;
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'subscriptions-export.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function onImportChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				try {
					const text = e.target?.result as string;
					const data = JSON.parse(text);

					const res = safeParse(importSubscriptionDataSchema, data);

					if (!res.success) {
						importError = 'Invalid subscription data format.';
						console.error('Import validation errors:', res.issues);
						return;
					}

					// TODO: Validate data structure here
					importedData = res.output;
				} catch (error) {
					importError = 'Failed to import subscriptions. Please check the file format.';
					console.error('Failed to import subscriptions:', error);
				}
			};
			reader.readAsText(file);
		}
	}

	function importData() {
		if (importedData) {
			subStore.importSubscriptions(importedData);
			importedData = null;
			importError = null;
		}
	}
</script>

<div class="mb-4">
	<a href={resolve('/')} class="0 inline-flex items-center text-sm hover:underline">
		<ArrowLeft class="mr-2 inline-block" size={16} />
		Back to App
	</a>
</div>
<h1 class="mb-8 text-2xl font-semibold">Settings</h1>

<div>
	<h2 class="mb-4 text-lg">Currency</h2>
	<select class="mb-8 rounded-md border p-2" bind:value={currencyStore.selected.current}>
		{#each Object.entries(currencies) as [code] (code)}
			<option value={code}>{code}</option>
		{/each}
	</select>
	<h2 class="mb-2 text-lg">Export & Import</h2>
	<p class="mb-4 max-w-[52ch] text-muted-foreground">
		Export or import data as a JSON file. Importing will overwrite existing subscriptions from the
		same service.
	</p>
	<div class="flex items-end gap-4">
		<Button type="button" variant="outline" onclick={exportData}>Export Data</Button>
		<div>
			<Label for="import" class="mb-1">Import Data</Label>
			<Input type="file" id="import" onchange={onImportChange} />
			{#if importError}
				<p class="text-destructive">{importError}</p>
			{/if}
		</div>
		{#if importedData}
			<Button type="button" onclick={importData}>Complete Import</Button>
		{/if}
	</div>

	{#if importedData}
		<div class="mt-8 rounded-md border p-4 shadow-md">
			<h2 class="mb-4">Imported data</h2>

			<SubscriptionSection subscriptions={importedData} />
		</div>
	{/if}
</div>
