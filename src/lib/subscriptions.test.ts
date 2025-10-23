import { describe, expect, it } from 'vitest';
import { addInterval, type Interval } from './subscriptions.svelte';

describe('subscriptions', () => {
	describe('addInterval', () => {
		it.each([
			[new Date(2024, 0, 31), { days: 0, weeks: 0, months: 1, years: 0 }, new Date(2024, 1, 29)], // Jan 31 + 1 month = Feb 29 (leap year)
			[new Date(2023, 0, 31), { days: 0, weeks: 0, months: 1, years: 0 }, new Date(2023, 1, 28)], // Jan 31 + 1 month = Feb 28 (non-leap)
			[new Date(2024, 7, 31), { days: 0, weeks: 0, months: 1, years: 0 }, new Date(2024, 8, 30)], // Aug 31 + 1 month = Sep 30
			[new Date(2024, 0, 1), { days: 0, weeks: 0, months: 12, years: 0 }, new Date(2025, 0, 1)] // 1 year by months
		])('should add a month interval', (startDate: Date, interval: Interval, expected: Date) => {
			const result = addInterval(startDate, interval);
			expect(result).toEqual(expected);
		});

		it.each([
			[new Date(2020, 1, 29), { days: 0, weeks: 0, months: 0, years: 1 }, new Date(2021, 1, 28)], // Leap day + 1 year
			[new Date(2023, 2, 1), { days: 0, weeks: 0, months: 0, years: 2 }, new Date(2025, 2, 1)],
			[new Date(2024, 11, 31), { days: 0, weeks: 0, months: 0, years: 1 }, new Date(2025, 11, 31)]
		])('should add a year interval', (startDate: Date, interval: Interval, expected: Date) => {
			const result = addInterval(startDate, interval);
			expect(result).toEqual(expected);
		});

		// Edge cases
		it('should handle zero interval (returns same date)', () => {
			const start = new Date(2024, 5, 15);
			const interval = { days: 0, weeks: 0, months: 0, years: 0 };
			expect(addInterval(start, interval)).toEqual(start);
		});

		it('should handle string input for startDate', () => {
			const result = addInterval('2024-01-01', { days: 1, weeks: 0, months: 0, years: 0 });
			expect(result).toEqual(new Date(2024, 0, 2));
		});

		it.each([
			[new Date(2024, 0, 1), { days: 1, weeks: 0, months: 0, years: 0 }, new Date(2024, 0, 2)],
			[new Date(2024, 0, 31), { days: 1, weeks: 0, months: 0, years: 0 }, new Date(2024, 1, 1)],
			[new Date(2024, 11, 31), { days: 1, weeks: 0, months: 0, years: 0 }, new Date(2025, 0, 1)],
			[new Date(2024, 0, 1), { days: 25, weeks: 0, months: 0, years: 0 }, new Date(2024, 0, 26)]
		])('should add a day interval', (startDate: Date, interval: Interval, expected: Date) => {
			const result = addInterval(startDate, interval);
			expect(result).toEqual(expected);
		});

		it.each([
			{
				startDate: new Date(2024, 0, 1),
				interval: { days: 0, weeks: 1, months: 0, years: 0 },
				expected: new Date(2024, 0, 8)
			},
			{
				startDate: new Date(2024, 0, 31),
				interval: { days: 0, weeks: 1, months: 0, years: 0 },
				expected: new Date(2024, 1, 7)
			},
			{
				startDate: new Date(2024, 11, 31),
				interval: { days: 0, weeks: 2, months: 0, years: 0 },
				expected: new Date(2025, 0, 14)
			}
		])('should add a week interval ', ({ startDate, interval, expected }) => {
			const result = addInterval(startDate, interval);
			expect(result).toEqual(expected);
		});
	});
});
