import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockValidate = vi.fn();
vi.mock('@/lib/api', () => ({
  default: { validateCoupon: (code: string, plan: string) => mockValidate(code, plan) }
}));

import CouponInput from './CouponInput';

describe('CouponInput', () => {
  beforeEach(() => {
    mockValidate.mockReset();
  });

  it('renders an input + apply button', () => {
    render(<CouponInput plan="mensal" originalCents={9990} onApply={vi.fn()} />);
    expect(screen.getByPlaceholderText(/cupom/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
  });

  it('auto-applies initialCode on mount', async () => {
    const onApply = vi.fn();
    mockValidate.mockResolvedValue({
      data: { code: 'PERSONAL70', original_cents: 9990, discount_cents: 6993, final_cents: 2997 }
    });

    render(
      <CouponInput plan="mensal" originalCents={9990} initialCode="PERSONAL70" onApply={onApply} />
    );

    await waitFor(() => expect(mockValidate).toHaveBeenCalledWith('PERSONAL70', 'mensal'));
    expect(await screen.findByText(/desconto de R\$ 69,93/i)).toBeInTheDocument();
    expect(onApply).toHaveBeenCalledWith('PERSONAL70');
  });

  it('does not auto-apply when initialCode is empty/null', async () => {
    const onApply = vi.fn();
    render(<CouponInput plan="mensal" originalCents={9990} initialCode={null} onApply={onApply} />);
    expect(mockValidate).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
  });

  it('disables apply button when input is empty', () => {
    render(<CouponInput plan="mensal" originalCents={9990} onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: /aplicar/i })).toBeDisabled();
  });

  it('calls validateCoupon with uppercase code on click', async () => {
    const user = userEvent.setup();
    mockValidate.mockResolvedValue({
      data: { code: 'PROMO10', original_cents: 9990, discount_cents: 999, final_cents: 8991 }
    });

    render(<CouponInput plan="mensal" originalCents={9990} onApply={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/cupom/i), 'promo10');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    await waitFor(() => expect(mockValidate).toHaveBeenCalledWith('PROMO10', 'mensal'));
  });

  it('shows discounted price after successful validation', async () => {
    const user = userEvent.setup();
    mockValidate.mockResolvedValue({
      data: { code: 'PROMO10', original_cents: 9990, discount_cents: 999, final_cents: 8991 }
    });

    render(<CouponInput plan="mensal" originalCents={9990} onApply={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/cupom/i), 'PROMO10');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    expect(await screen.findByText(/desconto de R\$ 9,99/i)).toBeInTheDocument();
    expect(screen.getByText(/total: R\$ 89,91/i)).toBeInTheDocument();
  });

  it('calls onApply with the validated code', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    mockValidate.mockResolvedValue({
      data: { code: 'PROMO10', original_cents: 9990, discount_cents: 999, final_cents: 8991 }
    });

    render(<CouponInput plan="mensal" originalCents={9990} onApply={onApply} />);
    await user.type(screen.getByPlaceholderText(/cupom/i), 'PROMO10');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    await waitFor(() => expect(onApply).toHaveBeenCalledWith('PROMO10'));
  });

  it('shows error when API rejects', async () => {
    const user = userEvent.setup();
    mockValidate.mockRejectedValue(new Error('Cupom expirou'));

    render(<CouponInput plan="mensal" originalCents={9990} onApply={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/cupom/i), 'OLD');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    expect(await screen.findByText(/cupom expirou/i)).toBeInTheDocument();
  });

  it('allows removing applied coupon and calls onApply with null', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    mockValidate.mockResolvedValue({
      data: { code: 'PROMO10', original_cents: 9990, discount_cents: 999, final_cents: 8991 }
    });

    render(<CouponInput plan="mensal" originalCents={9990} onApply={onApply} />);
    await user.type(screen.getByPlaceholderText(/cupom/i), 'PROMO10');
    await user.click(screen.getByRole('button', { name: /aplicar/i }));

    await screen.findByText(/desconto de/i);
    await user.click(screen.getByRole('button', { name: /remover/i }));

    expect(onApply).toHaveBeenLastCalledWith(null);
    expect(screen.queryByText(/desconto de/i)).not.toBeInTheDocument();
  });
});
