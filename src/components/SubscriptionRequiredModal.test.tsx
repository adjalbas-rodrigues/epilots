import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubscriptionRequiredModal from './SubscriptionRequiredModal';

describe('SubscriptionRequiredModal', () => {
  it('renders nothing when open is false', () => {
    const { container } = render(
      <SubscriptionRequiredModal open={false} onClose={() => {}} reason="SUBSCRIPTION_REQUIRED" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows generic subscription message when reason=SUBSCRIPTION_REQUIRED', () => {
    render(<SubscriptionRequiredModal open onClose={() => {}} reason="SUBSCRIPTION_REQUIRED" />);
    expect(screen.getByRole('heading', { name: /assinatura ativa necessária/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver planos/i })).toHaveAttribute('href', '/pricing');
  });

  it('shows upgrade message when reason=FEATURE_NOT_IN_PLAN', () => {
    render(
      <SubscriptionRequiredModal
        open
        onClose={() => {}}
        reason="FEATURE_NOT_IN_PLAN"
        currentPlan="questoes"
        feature="access_videos"
      />
    );
    expect(screen.getByRole('heading', { name: /upgrade/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fazer upgrade/i })).toHaveAttribute('href', '/pricing');
  });

  it('mentions the missing feature in human terms', () => {
    render(
      <SubscriptionRequiredModal open onClose={() => {}}
        reason="FEATURE_NOT_IN_PLAN" currentPlan="questoes" feature="access_videos" />
    );
    const matches = screen.getAllByText(/aulas em vídeo/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('calls onClose when backdrop or close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SubscriptionRequiredModal open onClose={onClose} reason="SUBSCRIPTION_REQUIRED" />);
    await user.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
