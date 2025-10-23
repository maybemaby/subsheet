import type { Interval } from './subscriptions.svelte';

export interface Plan {
	name: string;
	price: number;
	interval: Interval;
}

export interface Service {
	plans: Plan[];
	brandColor?: string;
}

export async function importServices() {
	const services = (await import('./services.json')).default as Record<string, Service>;
	return services;
}
