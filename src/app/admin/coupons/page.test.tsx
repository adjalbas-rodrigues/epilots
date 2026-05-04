import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = {
  getCoupons: vi.fn(),
  createCoupon: vi.fn(),
  updateCoupon: vi.fn(),
  deleteCoupon: vi.fn(),
  toggleCoupon: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: {
    getCoupons: () => mocks.getCoupons(),
    createCoupon: (d: any) => mocks.createCoupon(d),
    updateCoupon: (id: number, d: any) => mocks.updateCoupon(id, d),
    deleteCoupon: (id: number) => mocks.deleteCoupon(id),
    toggleCoupon: (id: number) => mocks.toggleCoupon(id)
  }
}));

import AdminCouponsPage from './page';

const sample = (overrides = {}) => ({
  id: 1,
  code: 'WELCOME10',
  discount_type: 'percent',
  discount_value: '10.00',
  max_uses: 100,
  used_count: 5,
  valid_from: null,
  valid_until: '2099-12-31',
  is_active: true,
  ...overrides
});

describe('AdminCouponsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mocks).forEach(m => m.mockReset());
    window.confirm = vi.fn(() => true);
  });

  it('shows loading state then renders coupons', async () => {
    mocks.getCoupons.mockResolvedValue({ status: 'success', data: [sample()] });
    render(<AdminCouponsPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(await screen.findByText('WELCOME10')).toBeInTheDocument();
  });

  it('renders empty state when no coupons exist', async () => {
    mocks.getCoupons.mockResolvedValue({ status: 'success', data: [] });
    render(<AdminCouponsPage />);
    expect(await screen.findByText(/nenhum cupom/i)).toBeInTheDocument();
  });

  it('shows used_count / max_uses fraction', async () => {
    mocks.getCoupons.mockResolvedValue({
      status: 'success',
      data: [sample({ used_count: 7, max_uses: 100 })]
    });
    render(<AdminCouponsPage />);
    expect(await screen.findByText('7 / 100')).toBeInTheDocument();
  });

  it('shows ∞ when max_uses is null', async () => {
    mocks.getCoupons.mockResolvedValue({
      status: 'success',
      data: [sample({ used_count: 5, max_uses: null })]
    });
    render(<AdminCouponsPage />);
    expect(await screen.findByText('5 / ∞')).toBeInTheDocument();
  });

  it('formats percent discount as "10%"', async () => {
    mocks.getCoupons.mockResolvedValue({
      status: 'success',
      data: [sample({ discount_type: 'percent', discount_value: '10.00' })]
    });
    render(<AdminCouponsPage />);
    expect(await screen.findByText('10%')).toBeInTheDocument();
  });

  it('formats fixed discount as "R$ 20,00"', async () => {
    mocks.getCoupons.mockResolvedValue({
      status: 'success',
      data: [sample({ discount_type: 'fixed', discount_value: '2000' })]
    });
    render(<AdminCouponsPage />);
    expect(await screen.findByText('R$ 20,00')).toBeInTheDocument();
  });

  it('opens create modal when "Novo Cupom" is clicked', async () => {
    const user = userEvent.setup();
    mocks.getCoupons.mockResolvedValue({ status: 'success', data: [] });
    render(<AdminCouponsPage />);

    await screen.findByText(/nenhum cupom/i);
    await user.click(screen.getByRole('button', { name: /novo cupom/i }));

    expect(screen.getByRole('heading', { name: /novo cupom/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/código/i)).toBeInTheDocument();
  });

  it('creates a percent coupon via the modal form', async () => {
    const user = userEvent.setup();
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [] });
    mocks.createCoupon.mockResolvedValue({ status: 'success', data: sample() });
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [sample()] });

    render(<AdminCouponsPage />);
    await screen.findByText(/nenhum cupom/i);

    await user.click(screen.getByRole('button', { name: /novo cupom/i }));
    await user.type(screen.getByLabelText(/código/i), 'NEW20');
    await user.clear(screen.getByLabelText(/valor do desconto/i));
    await user.type(screen.getByLabelText(/valor do desconto/i), '20');
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(mocks.createCoupon).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NEW20', discount_type: 'percent', discount_value: 20 })
      );
    });
  });

  it('toggles a coupon active/inactive', async () => {
    const user = userEvent.setup();
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [sample()] });
    mocks.toggleCoupon.mockResolvedValue({ status: 'success' });
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [sample({ is_active: false })] });

    render(<AdminCouponsPage />);
    await screen.findByText('WELCOME10');

    await user.click(screen.getByRole('button', { name: /desativar/i }));

    await waitFor(() => expect(mocks.toggleCoupon).toHaveBeenCalledWith(1));
  });

  it('asks confirmation before deleting and calls deleteCoupon', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [sample()] });
    mocks.deleteCoupon.mockResolvedValue({ status: 'success' });
    mocks.getCoupons.mockResolvedValueOnce({ status: 'success', data: [] });

    render(<AdminCouponsPage />);
    await screen.findByText('WELCOME10');

    await user.click(screen.getByRole('button', { name: /excluir/i }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mocks.deleteCoupon).toHaveBeenCalledWith(1));
  });

  it('does not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    mocks.getCoupons.mockResolvedValue({ status: 'success', data: [sample()] });

    render(<AdminCouponsPage />);
    await screen.findByText('WELCOME10');

    await user.click(screen.getByRole('button', { name: /excluir/i }));

    expect(mocks.deleteCoupon).not.toHaveBeenCalled();
  });
});
