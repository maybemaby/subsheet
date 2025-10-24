import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import CustomSub from './custom-sub.svelte';

describe('custom-sub component', () => {
	it('should render dialog on trigger click', async () => {
		const user = userEvent.setup();
		render(CustomSub);

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		expect(screen.getByText(/add custom subscription/i)).toBeDefined();
	});

	it('should render service name error if empty', async () => {
		const user = userEvent.setup();
		render(CustomSub);

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		const submitBtn = screen.getByRole('button', { name: /add subscription/i });
		await user.click(submitBtn);

		const serviceError = await screen.findByText(/Service name cannot be empty/i);
		expect(serviceError).toBeDefined();
	});

	it('should render plan name error if empty', async () => {
		const user = userEvent.setup();
		render(CustomSub);

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		const nameInput = screen.getByPlaceholderText('Netflix');
		await user.type(nameInput, 'Netflix');

		const submitBtn = screen.getByRole('button', { name: /add subscription/i });
		await user.click(submitBtn);

		const planError = await screen.findByText(/Plan name cannot be empty/i);
		expect(planError).toBeDefined();
	});

	it('should render price error if not a number or less than 0', async () => {
		const user = userEvent.setup();
		render(CustomSub);

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		const nameInput = screen.getByPlaceholderText('Netflix');
		const planInput = screen.getByPlaceholderText('Standard Plan');
		const priceInput = screen.getByPlaceholderText('9.99');

		await user.type(nameInput, 'Netflix');
		await user.type(planInput, 'Premium');
		await user.type(priceInput, '-5');

		const submitBtn = screen.getByRole('button', { name: /add subscription/i });
		await user.click(submitBtn);

		const priceError = await screen.findByText(/Invalid value: Expected >=0 but received -5/i);
		expect(priceError).toBeDefined();
	});

	it('should render billing interval error if all values are 0', async () => {
		const user = userEvent.setup();
		render(CustomSub);

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		const nameInput = screen.getByPlaceholderText('Netflix');
		const planInput = screen.getByPlaceholderText('Standard Plan');
		const priceInput = screen.getByPlaceholderText('9.99');

		await user.type(nameInput, 'Netflix');
		await user.type(planInput, 'Premium');
		await user.type(priceInput, '9.99');

		const submitBtn = screen.getByRole('button', { name: /add subscription/i });
		await user.click(submitBtn);

		const intervalError = await screen.findByText(
			/Interval must have at least one non-zero value/i
		);
		expect(intervalError).toBeDefined();
	});

	it('should call onadd callback on successful submission', async () => {
		const user = userEvent.setup();
		const onadd = vi.fn();
		render(CustomSub, { props: { onadd } });

		const trigger = screen.getByRole('button', { name: /custom subscription/i });
		await user.click(trigger);

		const nameInput = screen.getByPlaceholderText('Netflix');
		const planInput = screen.getByPlaceholderText('Standard Plan');
		const priceInput = screen.getByPlaceholderText('9.99');
		const weeksInput = screen.getByLabelText('Weeks');

		await user.type(nameInput, 'Netflix');
		await user.type(planInput, 'Premium');
		await user.type(priceInput, '15.99');
		await user.type(weeksInput, '4');

		const submitBtn = screen.getByRole('button', { name: /add subscription/i });
		await user.click(submitBtn);

		expect(onadd).toHaveBeenCalledOnce();
	});
});
