import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = {
  getAdminPayments: vi.fn(),
  approvePayment: vi.fn(),
  createManualPayment: vi.fn(),
  getStudents: vi.fn(),
  getPlansAdmin: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: {
    getAdminPayments: (p: any) => mocks.getAdminPayments(p),
    approvePayment: (id: number) => mocks.approvePayment(id),
    createManualPayment: (d: any) => mocks.createManualPayment(d),
    getStudents: (...args: any[]) => mocks.getStudents(...args),
    getPlansAdmin: () => mocks.getPlansAdmin()
  }
}));

import AdminPaymentsPage from './page';

const samplePayment = (overrides = {}) => ({
  id: 1,
  student_id: 5,
  plan: 'questoes',
  amount_cents: 4990,
  status: 'pending',
  provider: 'woovi',
  correlation_id: 'corr-1',
  payment_method: 'PIX',
  paid_at: null,
  created_at: new Date().toISOString(),
  student: { id: 5, name: 'João Silva', email: 'joao@test.com' },
  ...overrides
});

describe('AdminPaymentsPage', () => {
  beforeEach(() => {
    Object.values(mocks).forEach(m => m.mockReset());
    window.confirm = vi.fn(() => true);
    mocks.getStudents.mockResolvedValue({ data: { students: [] } });
    mocks.getPlansAdmin.mockResolvedValue({ data: [] });
  });

  it('shows loading state then list of payments', async () => {
    mocks.getAdminPayments.mockResolvedValue({
      data: { payments: [samplePayment()], total: 1, totalPages: 1 }
    });
    render(<AdminPaymentsPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(await screen.findByText('João Silva')).toBeInTheDocument();
  });

  it('shows status badges', async () => {
    mocks.getAdminPayments.mockResolvedValue({
      data: {
        payments: [
          samplePayment({ id: 1, status: 'pending' }),
          samplePayment({ id: 2, status: 'paid', correlation_id: 'c2' }),
          samplePayment({ id: 3, status: 'expired', correlation_id: 'c3' })
        ],
        total: 3, totalPages: 1
      }
    });
    render(<AdminPaymentsPage />);
    await screen.findAllByText('João Silva');
    const table = screen.getByRole('table');
    expect(table.querySelectorAll('span.bg-yellow-100')).toHaveLength(1); // pending
    expect(table.querySelectorAll('span.bg-green-100')).toHaveLength(1);  // paid
    expect(table.querySelectorAll('span.bg-red-100')).toHaveLength(1);    // expired
  });

  it('approves a pending payment after confirmation', async () => {
    const user = userEvent.setup();
    mocks.getAdminPayments.mockResolvedValueOnce({
      data: { payments: [samplePayment()], total: 1, totalPages: 1 }
    });
    mocks.approvePayment.mockResolvedValue({ status: 'success' });
    mocks.getAdminPayments.mockResolvedValueOnce({
      data: { payments: [samplePayment({ status: 'paid' })], total: 1, totalPages: 1 }
    });

    render(<AdminPaymentsPage />);
    await screen.findByText('João Silva');
    await user.click(screen.getByRole('button', { name: /aprovar/i }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mocks.approvePayment).toHaveBeenCalledWith(1));
  });

  it('approve button is hidden for already-paid payments', async () => {
    mocks.getAdminPayments.mockResolvedValue({
      data: { payments: [samplePayment({ status: 'paid', paid_at: new Date().toISOString() })], total: 1, totalPages: 1 }
    });
    render(<AdminPaymentsPage />);
    await screen.findByText('João Silva');
    expect(screen.queryByRole('button', { name: /aprovar/i })).not.toBeInTheDocument();
  });

  it('filters by status', async () => {
    const user = userEvent.setup();
    mocks.getAdminPayments.mockResolvedValue({
      data: { payments: [], total: 0, totalPages: 1 }
    });

    render(<AdminPaymentsPage />);
    await screen.findByText(/nenhum pagamento/i);

    await user.selectOptions(screen.getByLabelText(/status/i), 'paid');

    await waitFor(() => {
      expect(mocks.getAdminPayments).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'paid' })
      );
    });
  });
});
