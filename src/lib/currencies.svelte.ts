import { PersistedState } from 'runed';

export const currencies = {
	USD: {
		locale: 'en-US'
	},
	EUR: {
		locale: 'de-DE'
	},
	GBP: {
		locale: 'en-GB'
	},
	JPY: {
		locale: 'ja-JP'
	},
	AUD: {
		locale: 'en-AU'
	},
	CAD: {
		locale: 'en-CA'
	},
	CHF: {
		locale: 'de-CH'
	}
};

export type CurrencyCode = keyof typeof currencies;

export class CurrencyStore {
	selected = new PersistedState<CurrencyCode>('subs_currency', 'USD');
}

export const currencyStore = new CurrencyStore();

export function formatCurrency(amount: number, currency: CurrencyCode): string {
	const locale = currencies[currency].locale;
	return Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(amount);
}
