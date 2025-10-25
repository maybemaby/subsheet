// import { createCollection, type CollectionConfig } from '@tanstack/svelte-db';
import { PersistedState } from 'runed';
import {
	CalendarDate,
	getLocalTimeZone,
	parseAbsoluteToLocal,
	parseDate
} from '@internationalized/date';
import SuperJSON from 'superjson';
import * as v from 'valibot';
import { getContext, untrack } from 'svelte';
import type { Migration, PersistedData } from './persistence';

export const intervalSchema = v.pipe(
	v.object({
		days: v.pipe(v.number(), v.minValue(0), v.integer()),
		weeks: v.pipe(v.number(), v.minValue(0), v.integer()),
		months: v.pipe(v.number(), v.minValue(0), v.integer()),
		years: v.pipe(v.number(), v.minValue(0), v.integer())
	}),
	v.check(
		(input) => input.days + input.weeks + input.months + input.years > 0,
		'Interval must have at least one non-zero value'
	)
);

export type Interval = v.InferInput<typeof intervalSchema>;

export const importSubscriptionSchema = v.object({
	service: v.pipe(v.string(), v.nonEmpty('Service name cannot be empty')),
	plan: v.pipe(v.string(), v.nonEmpty('Plan name cannot be empty')),
	startDate: v.pipe(
		v.string(),
		v.transform((val) => {
			const dt = parseAbsoluteToLocal(val);

			return new CalendarDate(dt.year, dt.month, dt.day).toDate(getLocalTimeZone());
		}),
		v.date()
	),
	price: v.pipe(v.number(), v.minValue(0)),
	interval: intervalSchema
});

export const subscriptionSchema = v.object({
	service: v.pipe(v.string(), v.nonEmpty('Service name cannot be empty')),
	plan: v.pipe(v.string(), v.nonEmpty('Plan name cannot be empty')),
	startDate: v.date(),
	price: v.pipe(v.number(), v.minValue(0)),
	interval: intervalSchema
});

export const importSubscriptionDataSchema = v.record(v.string(), importSubscriptionSchema);

export type Subscription = v.InferInput<typeof subscriptionSchema>;

/**
 * Calculates the next billing date given a start date and interval.
 * @param startDate - The start date of the subscription (Date or string)
 * @param interval - The interval object { days, weeks, months, years }
 * @returns The next billing date as a Date object
 */
export function addInterval(startDate: Date | string, interval: Interval): Date {
	// CalendarDate expects year, month, day
	let date: CalendarDate;
	if (typeof startDate === 'string') {
		date = parseDate(startDate);
	} else {
		date = new CalendarDate(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
	}
	let nextDate = date;

	nextDate = nextDate.add({
		days: interval.days,
		weeks: interval.weeks,
		months: interval.months,
		years: interval.years
	});

	return nextDate.toDate(getLocalTimeZone());
}

export function getNextBillingDate(startDate: Date, interval: Interval): Date {
	let nextDate = startDate;

	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	while (nextDate === undefined || nextDate <= new Date()) {
		nextDate = addInterval(nextDate, interval);
	}

	return nextDate;
}

export function intervalToString(interval: Interval): string {
	const parts: string[] = [];

	if (interval.years) {
		parts.push(`${interval.years} year${interval.years > 1 ? 's' : ''}`);
	}
	if (interval.months) {
		parts.push(`${interval.months} month${interval.months > 1 ? 's' : ''}`);
	}
	if (interval.weeks) {
		parts.push(`${interval.weeks} week${interval.weeks > 1 ? 's' : ''}`);
	}
	if (interval.days) {
		parts.push(`${interval.days} day${interval.days > 1 ? 's' : ''}`);
	}

	return parts.join(', ');
}

export function differenceInDays(date1: Date, date2: Date): number {
	const oneDay = 1000 * 60 * 60 * 24; // milliseconds in a day
	const diffInTime = date2.getTime() - date1.getTime();
	return Math.ceil(diffInTime / oneDay);
}

export const subscriptionCtxKey = 'subscription' as const;

export function getSubscriptionContext() {
	return getContext<SubscriptionStore>(subscriptionCtxKey);
}

const currentMigrationVersion = 1;

type SubscriptionPersistedData = PersistedData<Record<string, Subscription>>;

export class SubscriptionStore {
	readonly migrations: Migration[] = [
		{
			version: 2,
			up: (data: unknown) => {
				return data;
			}
		}
	];

	subscriptionStorage = new PersistedState<SubscriptionPersistedData>(
		'subscriptions',
		{
			version: currentMigrationVersion,
			data: {}
		},
		{
			serializer: {
				serialize: SuperJSON.stringify,
				deserialize: SuperJSON.parse
			}
		}
	);

	public constructor() {
		// Effect so it only runs on client
		$effect(() => {
			untrack(() => {
				const currentVersion = this.subscriptionStorage.current.version;

				const targetVersion =
					this.migrations.sort((a, b) => b.version - a.version)[0]?.version ??
					currentMigrationVersion;

				console.log('Current subscription data version:', currentVersion);

				if (currentVersion < targetVersion) {
					console.log(
						'Migrating subscription data from version',
						currentVersion,
						'to',
						targetVersion
					);
				}
			});
		});
	}

	readonly subscriptions = $derived.by(() => {
		return this.subscriptionStorage.current.data;
	});

	totalCostPerMonth = $derived.by(() => {
		const subs = Object.values(this.subscriptions);
		let total = 0;

		subs.forEach((sub) => {
			const interval = sub.interval;
			const intervalInMonths =
				interval.years * 12 + interval.months + interval.weeks * (1 / 4) + interval.days * (1 / 30);

			total += sub.price / intervalInMonths;
		});

		return Math.round(total * 100) / 100;
	});

	totalCostPerYear = $derived.by(() => {
		const subs = Object.values(this.subscriptions);
		let total = 0;

		subs.forEach((sub) => {
			const interval = sub.interval;
			const intervalInYears =
				interval.years + interval.months / 12 + interval.weeks / 52 + interval.days / 365;

			total += sub.price / intervalInYears;
		});

		return Math.round(total * 100) / 100;
	});

	soonestSubscription = $derived.by(() => {
		const subs = Object.values(this.subscriptions);

		if (subs.length === 0) {
			return null;
		}

		subs.sort((a, b) => {
			const nextA = getNextBillingDate(a.startDate, a.interval);
			const nextB = getNextBillingDate(b.startDate, b.interval);

			return nextA.getTime() - nextB.getTime();
		});

		return {
			subscription: subs[0],
			nextDate: getNextBillingDate(subs[0].startDate, subs[0].interval)
		};
	});

	// ...existing code...
	addSubscription(subscription: Subscription) {
		this.subscriptionStorage.current.data[subscription.service] = subscription;
	}

	removeSubscription(serviceName: string) {
		const copy = { ...this.subscriptionStorage.current.data };
		delete copy[serviceName];
		this.subscriptionStorage.current.data = copy;
	}

	importSubscriptions(subs: Record<string, Subscription>) {
		this.subscriptionStorage.current.data = {
			...this.subscriptionStorage.current.data,
			...subs
		};
	}
}

// function createConfig(): CollectionConfig<Subscription> {
//   return {
//     schema: subscriptionSchema,
//     getKey(item) {
//       return item.name;
//     },

//   }
// }

// const subscriptionCollection = createCollection({
// 	schema: subscriptionSchema,
//   getKey(item) {
//     return item.name;
//   },
// });
