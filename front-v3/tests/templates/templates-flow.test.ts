import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { createTemplateServiceFromInMemory } from '../../src/adapters/template-service-from-in-memory.js';
import type { TemplateView } from '../../src/application/template/template-view.js';
import { formatEuros, parseEurosToNumber } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

const TEMPLATE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const OUTFLOW_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const BUDGET_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-emoji-picker-drawer id="emoji-picker-drawer"></buddj-emoji-picker-drawer>
    <buddj-budget-edit-drawer id="budget-edit-drawer"></buddj-budget-edit-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function seedTemplate(): TemplateView {
  return {
    id: TEMPLATE_ID,
    name: '📆 Modèle test',
    isDefault: false,
    month: '2026-01-01T00:00:00.000Z',
    startingBalance: 0,
    outflows: [{ id: OUTFLOW_ID, label: 'Loyer', amount: 100, isChecked: false, pendingFrom: null }],
    budgets: [{ id: BUDGET_ID, name: 'Courses', initialBalance: 50, pendingFrom: null }],
  };
}

function bootstrapTemplates(path: string): void {
  window.history.replaceState(null, '', path);
  bootstrap({
    authService: createAuthServiceFromInMemory(true),
    monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
    templateService: createTemplateServiceFromInMemory({ templates: [seedTemplate()], delayMs: 0 }),
  });
}

/** Total affiché dans l’en-tête détail template (somme charges + budgets). */
function readProjectedTotalEuros(): number {
  const el = document.querySelector('[data-new-month-projected]');
  expect(el).toBeTruthy();
  return parseEurosToNumber(el!.textContent ?? '');
}

function expectProjectedEuros(expected: number): void {
  expect(readProjectedTotalEuros()).toBeCloseTo(expected, 5);
}

describe('écran templates (API in-memory)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche la liste des templates', async () => {
    shellDocument();
    bootstrapTemplates('/templates');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Gérer les templates', level: 1 })).toBeTruthy();
      const link = document.querySelector(`a[data-template-id="${TEMPLATE_ID}"]`);
      expect(link).toBeTruthy();
      const line = link?.querySelector('buddj-line-item');
      expect(line?.getAttribute('label')).toBe('Modèle test');
    });
  });

  it('affiche le détail avec charges et budgets', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    expect(document.querySelectorAll('buddj-charge-item')).toHaveLength(1);
    fireEvent.click(screen.getByRole('tab', { name: 'Budgets' }));
    await waitFor(() => {
      expect(document.querySelectorAll('buddj-template-budget-card')).toHaveLength(1);
    });
  });

  it('renomme le template', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Renommer le template' }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'Modifier le template' })).toBeTruthy();
    });
    const input = document.querySelector('[data-budget-edit-label]') as HTMLInputElement;
    input.value = 'Plan renommé';
    fireEvent.input(input);
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Plan renommé', level: 1 })).toBeTruthy();
    });
  });

  it('active le template par défaut', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    const sw = screen.getByRole('switch', { name: /Template par défaut/i }) as HTMLInputElement;
    expect(sw.checked).toBe(false);
    fireEvent.click(sw);

    await waitFor(() => {
      const next = screen.getByRole('switch', { name: /Template par défaut/i }) as HTMLInputElement;
      expect(next.checked).toBe(true);
    });
  });

  it('ajoute puis supprime une charge', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });

    document.dispatchEvent(
      new CustomEvent('buddj-charge-add-done', {
        bubbles: true,
        detail: { label: 'Extra', amount: '25,00 €', emoji: '⚡' },
      }),
    );

    await waitFor(() => {
      expect(document.querySelectorAll('buddj-charge-item')).toHaveLength(2);
    });

    const extraItem = Array.from(document.getElementsByTagName('buddj-charge-item')).find(
      (el) => el.getAttribute('label') === 'Extra',
    );
    expect(extraItem).toBeTruthy();
    const del = extraItem!.querySelector('buddj-icon-delete');
    expect(del).toBeTruthy();
    fireEvent.click(del!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(document.querySelectorAll('buddj-charge-item')).toHaveLength(1);
    });
  });

  it('ajoute puis supprime un budget', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Budgets' }));

    document.dispatchEvent(
      new CustomEvent('buddj-budget-create-submit', {
        bubbles: true,
        composed: true,
        detail: { name: 'Loisirs test', initialBalance: 40 },
      }),
    );

    await waitFor(() => {
      expect(document.querySelectorAll('buddj-template-budget-card')).toHaveLength(2);
    });

    const cards = Array.from(document.getElementsByTagName('buddj-template-budget-card'));
    const loisirs = cards.find((c) => c.getAttribute('name') === 'Loisirs test');
    expect(loisirs).toBeTruthy();
    const del = loisirs!.querySelector('buddj-icon-delete');
    fireEvent.click(del!);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(document.querySelectorAll('buddj-template-budget-card')).toHaveLength(1);
    });
  });
});

describe('détail template — total projeté (data-new-month-projected)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('affiche charges + budgets au chargement (cohérent avec formatEuros)', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    const el = document.querySelector('[data-new-month-projected]');
    expect(el?.textContent?.trim()).toBe(formatEuros(150));
    expectProjectedEuros(150);
  });

  it('met à jour le total après ajout puis suppression d’une charge', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    expectProjectedEuros(150);

    document.dispatchEvent(
      new CustomEvent('buddj-charge-add-done', {
        bubbles: true,
        detail: { label: 'Extra', amount: '25,00 €', emoji: '⚡' },
      }),
    );
    await waitFor(() => {
      expectProjectedEuros(175);
    });

    const extraItem = Array.from(document.getElementsByTagName('buddj-charge-item')).find(
      (el) => el.getAttribute('label') === 'Extra',
    );
    fireEvent.click(extraItem!.querySelector('buddj-icon-delete')!);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expectProjectedEuros(150);
    });
    expect(document.querySelector('[data-new-month-projected]')?.textContent?.trim()).toBe(formatEuros(150));
  });

  it('met à jour le total après ajout puis suppression d’un budget', async () => {
    shellDocument();
    bootstrapTemplates(`/templates/${TEMPLATE_ID}`);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    expectProjectedEuros(150);

    fireEvent.click(screen.getByRole('tab', { name: 'Budgets' }));
    document.dispatchEvent(
      new CustomEvent('buddj-budget-create-submit', {
        bubbles: true,
        composed: true,
        detail: { name: 'Loisirs test', initialBalance: 40 },
      }),
    );
    await waitFor(() => {
      expectProjectedEuros(190);
    });

    const loisirs = Array.from(document.getElementsByTagName('buddj-template-budget-card')).find(
      (c) => c.getAttribute('name') === 'Loisirs test',
    );
    fireEvent.click(loisirs!.querySelector('buddj-icon-delete')!);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expectProjectedEuros(150);
    });
    expect(document.querySelector('[data-new-month-projected]')?.textContent?.trim()).toBe(formatEuros(150));
  });
});
