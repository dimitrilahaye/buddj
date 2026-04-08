import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import '../../src/register-components.js';
import { BuddjScreenReimbursements } from '../../src/components/screens/buddj-screen-reimbursements.js';
import { ReimbursementsStore } from '../../src/application/project/reimbursements-store.js';
import type { ProjectView } from '../../src/application/project/project-view.js';
import type { MonthState } from '../../src/application/month/month-state.js';
import type { MonthStore } from '../../src/application/month/month-store.js';
import type { MonthView } from '../../src/application/month/month-view.js';

function createProjectView({
  id,
  name,
  target,
  totalAmount,
}: {
  id: string;
  name: string;
  target: number;
  totalAmount: number;
}): ProjectView {
  return {
    id,
    name,
    target,
    totalAmount,
    canRollback: true,
    canReApply: false,
    canFinish: totalAmount === target,
    category: 'refund',
  };
}

function createReimbursementsStore({
  loadProjectsByCategory,
  createProject,
  addAmountToProject,
}: {
  loadProjectsByCategory: () => Promise<ProjectView[]>;
  createProject?: (input: { name: string; target: number; category: 'saving' | 'refund' }) => Promise<ProjectView>;
  addAmountToProject?: (input: { projectId: string; amount: number }) => Promise<ProjectView>;
}): ReimbursementsStore {
  const defaultProject = createProjectView({
    id: 'created',
    name: '💸 Nouveau',
    target: 10,
    totalAmount: 0,
  });
  return new ReimbursementsStore({
    loadProjectsByCategory: async () => loadProjectsByCategory(),
    createProject: createProject ?? (async () => defaultProject),
    updateProject: async () => defaultProject,
    addAmountToProject: addAmountToProject ?? (async () => defaultProject),
    rollbackProject: async () => defaultProject,
    reApplyProject: async () => defaultProject,
    deleteProject: async () => undefined,
  });
}

function createMonthStoreMock({ projectedBalance }: { projectedBalance: number }): MonthStore {
  const month: MonthView = {
    id: 'm-1',
    isoDate: '2026-04-01T00:00:00.000Z',
    displayLabel: 'avril 2026',
    currentBalance: 1000,
    projectedBalance,
    budgetGroups: [],
    chargeGroups: [],
    outflows: [],
  };
  const state: MonthState = {
    months: [month],
    currentIndex: 0,
    isLoadingMonths: false,
    loadMonthsErrorMessage: null,
    pendingRouteMonthId: null,
  };
  const et = new EventTarget() as EventTarget & Pick<MonthStore, 'getState' | 'emitAction'>;
  et.getState = () => state;
  et.emitAction = () => {};
  return et as unknown as MonthStore;
}

describe('écran remboursements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
      <buddj-goal-add-drawer id="goal-add-drawer"></buddj-goal-add-drawer>
      <buddj-goal-edit-drawer id="goal-edit-drawer"></buddj-goal-edit-drawer>
      <buddj-goal-amount-drawer id="goal-amount-drawer"></buddj-goal-amount-drawer>
      <buddj-goal-injection-drawer id="goal-injection-drawer"></buddj-goal-injection-drawer>
      <div id="host"></div>
    `;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('affiche le restant (target - totalAmount) et extrait l’emoji en icône', async () => {
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [
        createProjectView({
          id: 'r1',
          name: '🚲 Achat vélo',
          target: 350,
          totalAmount: 80,
        }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="r1"]')).toBeTruthy();
    });

    const card = document.querySelector('buddj-goal-card[data-id="r1"]');
    expect(card).toBeTruthy();
    expect(card?.getAttribute('icon')).toBe('🚲');
    expect(card?.getAttribute('name')).toBe('Achat vélo');
    expect(card?.getAttribute('remaining')).toBe('270');
  });

  it("affiche l'erreur brute quand le chargement échoue", async () => {
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => {
        throw new Error('Backend en panne');
      },
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
    expect(screen.getByRole('alert').textContent).toContain('Backend en panne');
  });

  it("concatène emoji + nom lors de la création avant l'appel API", async () => {
    let createInput:
      | {
          name: string;
          target: number;
          category: 'saving' | 'refund';
        }
      | null = null;
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [],
      createProject: async (input) => {
        createInput = input;
        return createProjectView({
          id: 'r-created',
          name: input.name,
          target: input.target,
          totalAmount: 0,
        });
      },
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ajouter un remboursement' })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un remboursement' }));

    const drawer = document.getElementById('goal-add-drawer') as HTMLElement & { _total?: string };
    const input = screen.getByRole('textbox', { name: 'Intitulé' }) as HTMLInputElement;
    expect(input).toBeTruthy();
    input.value = 'Velo';
    fireEvent.input(input);
    drawer._total = '15,00 €';
    const validateButton = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement;
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(createInput).not.toBeNull();
    });
    expect(createInput).toMatchObject({
      name: '💸 Velo',
      target: 15,
      category: 'refund',
    });
  });

  it('applique le style terminé quand remaining vaut 0', async () => {
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [
        createProjectView({
          id: 'r-done',
          name: '🔥 Toto',
          target: 100,
          totalAmount: 100,
        }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ajouter une somme' })).toBeTruthy();
    });
    const addAmountButton = screen.getByRole('button', {
      name: 'Ajouter une somme',
    }) as HTMLButtonElement;
    expect(addAmountButton.disabled).toBe(true);
  });

  it("désactive l'option injecter si le solde prévisionnel est à 0", async () => {
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 'r2', name: '💸 Assurance', target: 80, totalAmount: 10 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 0 }) });
    host.appendChild(el);

    const injectBtn = (await screen.findByRole('button', { name: /Injecter un montant/i })) as HTMLButtonElement;
    expect(injectBtn.disabled).toBe(true);
  });

  it('injecte le min(sp_clone, montant_temp, remaining) après confirmation', async () => {
    const addAmountSpy = vi.fn(async ({ projectId, amount }: { projectId: string; amount: number }) => {
      return createProjectView({
        id: projectId,
        name: '💸 Assurance',
        target: 90,
        totalAmount: amount,
      });
    });
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 'r3', name: '💸 Assurance', target: 90, totalAmount: 0 }),
      ],
      addAmountToProject: addAmountSpy,
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="r3"]')).toBeTruthy();
    });

    const privateEl = el as unknown as {
      _injectionRemainingAmount: number;
      _injectionTemporaryAmount: number;
      confirmInjection: (input: { projectId: string }) => void;
    };
    privateEl._injectionRemainingAmount = 100;
    privateEl._injectionTemporaryAmount = 100;
    privateEl.confirmInjection({ projectId: 'r3' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(addAmountSpy).toHaveBeenCalled();
    });
    expect(addAmountSpy.mock.calls[0]?.[0]).toMatchObject({ projectId: 'r3', amount: 90 });
  });

  it('affiche "(sur sp_clone)" quand le montant temporaire diffère du solde restant', async () => {
    const store = createReimbursementsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 'r4', name: '💸 Projet', target: 300, totalAmount: 20 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenReimbursements.tagName) as InstanceType<typeof BuddjScreenReimbursements>;
    el.init({ reimbursementsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="r4"]')).toBeTruthy();
    });

    const privateEl = el as unknown as {
      _isInjectionDrawerOpen: boolean;
      _injectionRemainingAmount: number;
      _injectionTemporaryAmount: number;
      openInjectionDrawer: () => void;
    };
    privateEl._isInjectionDrawerOpen = true;
    privateEl._injectionRemainingAmount = 100;
    privateEl._injectionTemporaryAmount = 60;
    privateEl.openInjectionDrawer();

    await waitFor(() => {
      expect(screen.getByText(/\(sur 100,00 €\)/i)).toBeTruthy();
    });
  });
});
