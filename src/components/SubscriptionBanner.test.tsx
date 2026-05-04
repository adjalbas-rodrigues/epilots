import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockGetMySubscription = vi.fn();

vi.mock('@/lib/api', () => ({
  default: {
    getMySubscription: () => mockGetMySubscription()
  }
}));

import SubscriptionBanner from './SubscriptionBanner';

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

describe('SubscriptionBanner', () => {
  beforeEach(() => {
    mockGetMySubscription.mockReset();
  });

  it('renders nothing while loading', () => {
    mockGetMySubscription.mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<SubscriptionBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "ainda não tem assinatura" CTA when subscription is null', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: { hasActiveSubscription: false, subscription: null, daysRemaining: null }
    });

    render(<SubscriptionBanner />);

    expect(await screen.findByText(/não tem uma assinatura ativa/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver planos/i })).toHaveAttribute('href', '/pricing');
  });

  it('shows "expirou" when status=expired', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: false,
        subscription: { id: 1, plan: 'mensal', status: 'expired', end_date: inDays(-3), amount: 99.9 },
        daysRemaining: -3
      }
    });

    render(<SubscriptionBanner />);

    expect(await screen.findByText(/sua assinatura expirou/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /renovar/i })).toBeInTheDocument();
  });

  it('shows "cancelada" when status=cancelled', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: false,
        subscription: { id: 1, plan: 'mensal', status: 'cancelled', end_date: inDays(-1), amount: 99.9 },
        daysRemaining: -1
      }
    });

    render(<SubscriptionBanner />);

    expect(await screen.findByText(/cancelada/i)).toBeInTheDocument();
  });

  it('shows warning banner when daysRemaining ≤ 7', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: true,
        subscription: { id: 1, plan: 'mensal', status: 'active', end_date: inDays(3), amount: 99.9 },
        daysRemaining: 3
      }
    });

    render(<SubscriptionBanner />);

    expect(await screen.findByText(/vence em 3 dias/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /renovar/i })).toBeInTheDocument();
  });

  it('shows "vence hoje" when daysRemaining=0', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: true,
        subscription: { id: 1, plan: 'mensal', status: 'active', end_date: inDays(0), amount: 99.9 },
        daysRemaining: 0
      }
    });

    render(<SubscriptionBanner />);
    expect(await screen.findByText(/vence hoje/i)).toBeInTheDocument();
  });

  it('shows success banner when subscription has more than 7 days remaining', async () => {
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: true,
        subscription: { id: 1, plan: 'anual', status: 'active', end_date: inDays(90), amount: 838.8 },
        daysRemaining: 90
      }
    });

    render(<SubscriptionBanner />);
    expect(await screen.findByText(/plano anual ativo/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /renovar/i })).not.toBeInTheDocument();
  });

  it('disappears after dismiss is clicked', async () => {
    const user = userEvent.setup();
    mockGetMySubscription.mockResolvedValue({
      data: {
        hasActiveSubscription: true,
        subscription: { id: 1, plan: 'mensal', status: 'active', end_date: inDays(60), amount: 99.9 },
        daysRemaining: 60
      }
    });

    render(<SubscriptionBanner />);
    await screen.findByText(/plano mensal ativo/i);

    await user.click(screen.getByRole('button', { name: /dispensar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/plano mensal ativo/i)).not.toBeInTheDocument();
    });
  });

  it('renders nothing when API throws', async () => {
    mockGetMySubscription.mockRejectedValue(new Error('boom'));
    const { container } = render(<SubscriptionBanner />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });
});
