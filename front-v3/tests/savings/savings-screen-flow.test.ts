import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import '../../src/register-components.js';
import { BuddjScreenSavings } from '../../src/components/screens/buddj-screen-savings.js';
import { SavingsStore } from '../../src/application/project/savings-store.js';
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
    category: 'saving',
  };
}

function createSavingsStore({
  loadProjectsByCategory,
  createProject,
  addAmountToProject,
}: {
  loadProjectsByCategory: () => Promise<ProjectView[]>;
  createProject?: (input: { name: string; target: number; category: 'saving' | 'refund' }) => Promise<ProjectView>;
  addAmountToProject?: (input: { projectId: string; amount: number }) => Promise<ProjectView>;
}): SavingsStore {
  const defaultProject = createProjectView({
    id: 'created',
    name: '🐖 Nouveau',
    target: 10,
    totalAmount: 0,
  });
  return new SavingsStore({
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

describe('écran économies', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
      <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
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
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({
          id: 's1',
          name: '🏖️ Vacances',
          target: 500,
          totalAmount: 120,
        }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="s1"]')).toBeTruthy();
    });

    const card = document.querySelector('buddj-goal-card[data-id="s1"]');
    expect(card).toBeTruthy();
    expect(card?.getAttribute('icon')).toBe('🏖️');
    expect(card?.getAttribute('name')).toBe('Vacances');
    expect(card?.getAttribute('remaining')).toBe('380');
  });

  it("concatène emoji + nom lors de la création avant l'appel API", async () => {
    let createInput:
      | {
          name: string;
          target: number;
          category: 'saving' | 'refund';
        }
      | null = null;
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [],
      createProject: async (input) => {
        createInput = input;
        return createProjectView({
          id: 's-created',
          name: input.name,
          target: input.target,
          totalAmount: 0,
        });
      },
    });

    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: "Ajouter un objectif d'épargne" })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: "Ajouter un objectif d'épargne" }));

    const drawer = document.getElementById('goal-add-drawer') as HTMLElement & { _total?: string };
    const input = screen.getByRole('textbox', { name: 'Intitulé' }) as HTMLInputElement;
    expect(input).toBeTruthy();
    input.value = 'Vacances';
    fireEvent.input(input);
    drawer._total = '10,00 €';
    const validateButton = screen.getByRole('button', { name: 'Valider' }) as HTMLButtonElement;
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(createInput).not.toBeNull();
    });
    expect(createInput).toMatchObject({
      name: '🐖 Vacances',
      target: 10,
      category: 'saving',
    });
  });

  it('applique le style terminé quand remaining vaut 0', async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({
          id: 's-done',
          name: '🔥 Toto',
          target: 100,
          totalAmount: 100,
        }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 120 }) });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ajouter une somme' })).toBeTruthy();
    });
    const addAmountButton = screen.getByRole('button', {
      name: 'Ajouter une somme',
    }) as HTMLButtonElement;
    expect(addAmountButton.disabled).toBe(true);
  });

  it("désactive l'option injecter si aucun projet injectable n'est disponible", async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's-finished', name: '🐖 Livret A', target: 120, totalAmount: 120 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    const injectBtn = (await screen.findByRole('button', { name: /Injecter un montant/i })) as HTMLButtonElement;
    expect(injectBtn.disabled).toBe(true);
  });

  it('affiche le badge vert sur le dropdown quand le solde prévisionnel est positif', async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's-badge', name: '🐖 Projet', target: 80, totalAmount: 10 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 42 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(screen.getByLabelText('Transfert disponible')).toBeTruthy();
    });
  });

  it("affiche l'encart rappel après fermeture du drawer si une injection a été faite", async () => {
    const addAmountSpy = vi.fn(async ({ projectId, amount }: { projectId: string; amount: number }) => {
      return createProjectView({
        id: projectId,
        name: '🐖 Livret A',
        target: 100,
        totalAmount: amount,
      });
    });
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's3', name: '🐖 Livret A', target: 100, totalAmount: 0 }),
      ],
      addAmountToProject: addAmountSpy,
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="s3"]')).toBeTruthy();
    });

    const privateEl = el as unknown as {
      _injectionRemainingAmount: number;
      _injectionTemporaryAmount: number;
      _injectionTransferredTotal: number;
      closeInjectionDrawer: (input: { showReminder: boolean }) => void;
      confirmInjection: (input: { projectId: string }) => void;
    };
    privateEl._injectionRemainingAmount = 100;
    privateEl._injectionTemporaryAmount = 100;
    privateEl.confirmInjection({ projectId: 's3' });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Confirmer' })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(addAmountSpy).toHaveBeenCalled();
    });
    privateEl._injectionTransferredTotal = 100;
    privateEl.closeInjectionDrawer({ showReminder: true });
    await waitFor(() => {
      expect(screen.getByText(/Vous venez de transférer/i)).toBeTruthy();
    });
  });

  it('affiche "(sur sp_clone)" quand le montant temporaire diffère du solde restant', async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's4', name: '🐖 Projet', target: 300, totalAmount: 20 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="s4"]')).toBeTruthy();
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

  it('ouvre directement la calculatrice quand on clique le montant du drawer injection', async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's-calc', name: '🐖 Projet', target: 300, totalAmount: 20 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="s-calc"]')).toBeTruthy();
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

    const amountBtn = screen.getByRole('button', { name: 'Modifier le montant à injecter' }) as HTMLButtonElement;
    fireEvent.click(amountBtn);
    expect(screen.getByRole('dialog', { name: 'Injecter un montant' })).toBeTruthy();
  });

  it('affiche le montant restant avec suffixe "restants" dans la liste du drawer injection', async () => {
    const store = createSavingsStore({
      loadProjectsByCategory: async () => [
        createProjectView({ id: 's-rem', name: '🐖 Projet', target: 200, totalAmount: 150 }),
      ],
    });
    const host = document.getElementById('host')!;
    const el = document.createElement(BuddjScreenSavings.tagName) as InstanceType<typeof BuddjScreenSavings>;
    el.init({ savingsStore: store, monthStore: createMonthStoreMock({ projectedBalance: 100 }) });
    host.appendChild(el);

    await screen.findByRole('button', { name: /Injecter un montant/i });
    await waitFor(() => {
      expect(document.querySelector('buddj-goal-card[data-id="s-rem"]')).toBeTruthy();
    });

    const privateEl = el as unknown as {
      _isInjectionDrawerOpen: boolean;
      _injectionRemainingAmount: number;
      _injectionTemporaryAmount: number;
      openInjectionDrawer: () => void;
    };
    privateEl._isInjectionDrawerOpen = true;
    privateEl._injectionRemainingAmount = 100;
    privateEl._injectionTemporaryAmount = 100;
    privateEl.openInjectionDrawer();

    await waitFor(() => {
      const suffix = screen.getByText('restants');
      const amountRow = suffix.closest('.goal-injection-project-amount');
      expect(amountRow?.textContent).toContain('50,00 €');
    });
  });
});
