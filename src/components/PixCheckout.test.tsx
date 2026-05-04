import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = {
  createPixCharge: vi.fn(),
  createPixSubscription: vi.fn(),
  getPaymentStatus: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: {
    createPixCharge: (plan: string, code: string | null) => mocks.createPixCharge(plan, code),
    createPixSubscription: (plan: string) => mocks.createPixSubscription(plan),
    getPaymentStatus: (id: string) => mocks.getPaymentStatus(id)
  }
}));

import PixCheckout from './PixCheckout';

const tomorrow = () => new Date(Date.now() + 86400000).toISOString();

describe('PixCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mocks).forEach(m => m.mockReset());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('one-off PIX charge', () => {
    it('calls createPixCharge with plan and (optional) coupon code', async () => {
      mocks.createPixCharge.mockResolvedValue({
        data: {
          payment_id: 1,
          correlation_id: 'corr-1',
          plan: 'mensal',
          amount_brl: '99.90',
          pix_qr_code: 'qr-data',
          pix_br_code: 'br-code',
          expires_at: tomorrow(),
          status_payment: 'pending'
        }
      });

      render(<PixCheckout plan="mensal" amountCents={9990} couponCode="SAVE10" mode="one-off" onPaid={vi.fn()} />);

      await waitFor(() => expect(mocks.createPixCharge).toHaveBeenCalledWith('mensal', 'SAVE10'));
    });

    it('renders QR code image and copy-paste BR code after charge created', async () => {
      mocks.createPixCharge.mockResolvedValue({
        data: {
          payment_id: 1,
          correlation_id: 'corr-1',
          plan: 'mensal',
          amount_brl: '99.90',
          pix_qr_code: 'qr-img',
          pix_br_code: 'br-code-string',
          expires_at: tomorrow(),
          status_payment: 'pending'
        }
      });

      render(<PixCheckout plan="mensal" amountCents={9990} mode="one-off" onPaid={vi.fn()} />);

      const qr = await screen.findByAltText(/qr/i);
      expect(qr).toHaveAttribute('src', 'qr-img');
      expect(screen.getByDisplayValue('br-code-string')).toBeInTheDocument();
    });

    it('calls onPaid when polling returns status=paid', async () => {
      const onPaid = vi.fn();

      mocks.createPixCharge.mockResolvedValue({
        data: {
          payment_id: 1,
          correlation_id: 'corr-1',
          plan: 'mensal',
          amount_brl: '99.90',
          pix_qr_code: 'qr',
          pix_br_code: 'br',
          expires_at: tomorrow(),
          status_payment: 'pending'
        }
      });
      mocks.getPaymentStatus.mockResolvedValue({ data: { status: 'paid' } });

      render(<PixCheckout plan="mensal" amountCents={9990} mode="one-off" onPaid={onPaid} pollIntervalMs={50} />);

      await waitFor(() => expect(onPaid).toHaveBeenCalled(), { timeout: 3000 });
    });

    it('shows error message when API fails', async () => {
      mocks.createPixCharge.mockRejectedValue(new Error('Falha ao gerar PIX'));
      render(<PixCheckout plan="mensal" amountCents={9990} mode="one-off" onPaid={vi.fn()} />);

      expect(await screen.findByText(/falha ao gerar pix/i)).toBeInTheDocument();
    });
  });

  describe('recurring PIX (PIX Automático)', () => {
    it('calls createPixSubscription when mode=recurring', async () => {
      mocks.createPixSubscription.mockResolvedValue({
        data: {
          woovi_subscription_id: 'sub-1',
          plan: 'anual',
          amount_brl: '838.80',
          interval_months: 12,
          pix_qr_code: 'qr',
          pix_br_code: 'br',
          authorization_url: 'https://auth.example'
        }
      });

      render(<PixCheckout plan="anual" amountCents={83880} mode="recurring" onPaid={vi.fn()} />);

      await waitFor(() => expect(mocks.createPixSubscription).toHaveBeenCalledWith('anual'));
      expect(mocks.createPixCharge).not.toHaveBeenCalled();
    });

    it('shows authorization URL link when present', async () => {
      mocks.createPixSubscription.mockResolvedValue({
        data: {
          woovi_subscription_id: 'sub-1',
          plan: 'anual',
          amount_brl: '838.80',
          interval_months: 12,
          pix_qr_code: 'qr',
          pix_br_code: 'br',
          authorization_url: 'https://auth.example'
        }
      });

      render(<PixCheckout plan="anual" amountCents={83880} mode="recurring" onPaid={vi.fn()} />);

      const link = await screen.findByRole('link', { name: /autorizar/i });
      expect(link).toHaveAttribute('href', 'https://auth.example');
    });
  });
});
