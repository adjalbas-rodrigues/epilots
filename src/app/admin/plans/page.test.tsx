import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mocks = {
  getPlansAdmin: vi.fn(),
  updatePlan: vi.fn(),
  togglePlan: vi.fn(),
  deletePlan: vi.fn()
};

vi.mock('@/lib/api', () => ({
  default: {
    getPlansAdmin: () => mocks.getPlansAdmin(),
    updatePlan: (id: number, d: any) => mocks.updatePlan(id, d),
    togglePlan: (id: number) => mocks.togglePlan(id),
    deletePlan: (id: number) => mocks.deletePlan(id)
  }
}));

import AdminPlansPage from './page';

const sample = (overrides = {}) => ({
  id: 1,
  code: 'questoes',
  name: 'Plano Questões',
  price_cents: 4990,
  duration_days: 30,
  access_questions: true,
  access_courses: false,
  access_videos: false,
  is_active: true,
  display_order: 1,
  description: 'Acesso ilimitado',
  savings_label: null,
  ...overrides
});

describe('AdminPlansPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mocks).forEach(m => m.mockReset());
    window.confirm = vi.fn(() => true);
  });

  it('renders loading then plans', async () => {
    mocks.getPlansAdmin.mockResolvedValue({ data: [sample()] });
    render(<AdminPlansPage />);
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(await screen.findByText('Plano Questões')).toBeInTheDocument();
  });

  it('shows the price formatted in BRL', async () => {
    mocks.getPlansAdmin.mockResolvedValue({ data: [sample({ price_cents: 12990 })] });
    render(<AdminPlansPage />);
    expect(await screen.findByText(/R\$\s*129,90/)).toBeInTheDocument();
  });

  it('shows feature flags as badges', async () => {
    mocks.getPlansAdmin.mockResolvedValue({
      data: [sample({
        code: 'premium',
        name: 'Premium',
        access_questions: true,
        access_courses: true,
        access_videos: true
      })]
    });
    render(<AdminPlansPage />);
    await screen.findByText('Premium');
    expect(screen.getByText(/questões/i)).toBeInTheDocument();
    expect(screen.getByText(/curso/i)).toBeInTheDocument();
    expect(screen.getByText(/vídeo/i)).toBeInTheDocument();
  });

  it('opens edit modal when row is clicked', async () => {
    const user = userEvent.setup();
    mocks.getPlansAdmin.mockResolvedValue({ data: [sample()] });
    render(<AdminPlansPage />);
    await screen.findByText('Plano Questões');
    await user.click(screen.getByRole('button', { name: /editar plano questões/i }));
    expect(screen.getByRole('heading', { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
  });

  it('updates price and feature flags via modal', async () => {
    const user = userEvent.setup();
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [sample()] });
    mocks.updatePlan.mockResolvedValue({ status: 'success' });
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [sample({ price_cents: 5500 })] });

    render(<AdminPlansPage />);
    await screen.findByText('Plano Questões');
    await user.click(screen.getByRole('button', { name: /editar plano questões/i }));

    const priceInput = screen.getByLabelText(/preço/i) as HTMLInputElement;
    await user.clear(priceInput);
    await user.type(priceInput, '55.00');
    await user.click(screen.getByLabelText(/aulas em vídeo/i));
    await user.click(screen.getByRole('button', { name: /^salvar$/i }));

    await waitFor(() => {
      expect(mocks.updatePlan).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          price_cents: 5500,
          access_videos: true
        })
      );
    });
  });

  it('toggles plan active/inactive', async () => {
    const user = userEvent.setup();
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [sample()] });
    mocks.togglePlan.mockResolvedValue({ status: 'success' });
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [sample({ is_active: false })] });

    render(<AdminPlansPage />);
    await screen.findByText('Plano Questões');
    await user.click(screen.getByRole('button', { name: /desativar/i }));

    await waitFor(() => expect(mocks.togglePlan).toHaveBeenCalledWith(1));
  });

  it('confirms before deleting and calls deletePlan', async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [sample()] });
    mocks.deletePlan.mockResolvedValue({ status: 'success' });
    mocks.getPlansAdmin.mockResolvedValueOnce({ data: [] });

    render(<AdminPlansPage />);
    await screen.findByText('Plano Questões');
    await user.click(screen.getByRole('button', { name: /excluir/i }));

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(mocks.deletePlan).toHaveBeenCalledWith(1));
  });
});
