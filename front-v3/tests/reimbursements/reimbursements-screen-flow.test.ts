import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import '../../src/register-components.js';
import { BuddjScreenReimbursements } from '../../src/components/screens/buddj-screen-reimbursements.js';
import { ReimbursementsStore } from '../../src/application/project/reimbursements-store.js';
import type { ProjectView } from '../../src/application/project/project-view.js';

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
}: {
  loadProjectsByCategory: () => Promise<ProjectView[]>;
  createProject?: (input: { name: string; target: number; category: 'saving' | 'refund' }) => Promise<ProjectView>;
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
    addAmountToProject: async () => defaultProject,
    rollbackProject: async () => defaultProject,
    reApplyProject: async () => defaultProject,
    deleteProject: async () => undefined,
  });
}

describe('écran remboursements', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <buddj-toast></buddj-toast>
      <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
      <buddj-goal-add-drawer id="goal-add-drawer"></buddj-goal-add-drawer>
      <buddj-goal-edit-drawer id="goal-edit-drawer"></buddj-goal-edit-drawer>
      <buddj-goal-amount-drawer id="goal-amount-drawer"></buddj-goal-amount-drawer>
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
    el.init({ reimbursementsStore: store });
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
    el.init({ reimbursementsStore: store });
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
    el.init({ reimbursementsStore: store });
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
    el.init({ reimbursementsStore: store });
    host.appendChild(el);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Ajouter une somme' })).toBeTruthy();
    });
    const addAmountButton = screen.getByRole('button', {
      name: 'Ajouter une somme',
    }) as HTMLButtonElement;
    expect(addAmountButton.disabled).toBe(true);
  });
});
