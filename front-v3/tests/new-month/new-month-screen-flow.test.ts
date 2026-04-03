import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/dom';
import { createAuthServiceFromInMemory } from '../../src/adapters/auth-service-from-in-memory.js';
import { createMonthServiceFromInMemory } from '../../src/adapters/month-service-from-in-memory.js';
import { createTemplateServiceFromInMemory } from '../../src/adapters/template-service-from-in-memory.js';
import { createYearlyOutflowsServiceFromInMemory } from '../../src/adapters/yearly-outflows-service-from-in-memory.js';
import { createEmptyYearlyOutflowsView } from '../../src/application/yearly-outflows/yearly-outflows-view.js';
import type { TemplateView } from '../../src/application/template/template-view.js';
import { parseEurosToNumber } from '../../src/shared/goal.js';
import '../../src/register-components.js';
import { bootstrap } from '../../src/bootstrap.js';

const TEMPLATE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function shellDocument(): void {
  document.body.innerHTML = `
    <buddj-toast></buddj-toast>
    <buddj-confirm-modal id="delete-confirm-modal"></buddj-confirm-modal>
    <buddj-calculator-drawer id="calculator-drawer"></buddj-calculator-drawer>
    <buddj-charge-add-drawer id="charge-add-drawer"></buddj-charge-add-drawer>
    <buddj-budget-add-drawer id="budget-add-drawer"></buddj-budget-add-drawer>
    <main id="screen-outlet" role="main"></main>
  `;
}

function seedTemplate(): TemplateView {
  return {
    id: TEMPLATE_ID,
    name: 'Défaut',
    isDefault: true,
    month: '2026-06-01T00:00:00.000Z',
    startingBalance: 2000,
    outflows: [{ id: 'o1', label: '🔥 Loyer', amount: 500, isChecked: false, pendingFrom: null }],
    budgets: [{ id: 'wb1', name: '🎯 Courses', initialBalance: 200, pendingFrom: null }],
  };
}

function readProjectedEuros(): number {
  const el = document.querySelector('[data-new-month-projected]');
  expect(el).toBeTruthy();
  return parseEurosToNumber(el!.textContent ?? '');
}

describe('écran création de mois', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/new-month');
  });

  it('met à jour le prévisionnel quand une charge template est exclue puis incluse', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({ initial: yearlyView, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });

    const cb = document.querySelector(
      'input[data-new-month-include="charge"]'
    ) as HTMLInputElement;
    expect(cb).toBeTruthy();
    cb.checked = false;
    fireEvent.change(cb);

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 200, 5);
    });

    cb.checked = true;
    fireEvent.change(cb);

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });
  });

  it('met à jour le prévisionnel après suppression confirmée d’une charge template', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({ initial: yearlyView, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });

    const dd = document.querySelector(
      'buddj-actions-dropdown[data-dropdown-role="template-charge"]'
    ) as HTMLElement;
    expect(dd).toBeTruthy();
    dd.dispatchEvent(
      new CustomEvent('buddj-dropdown-action', {
        bubbles: true,
        composed: true,
        detail: { actionId: 'delete', targetId: 'o1' },
      })
    );
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 200, 5);
    });
  });

  it('affiche le solde prévisionnel cohérent après chargement (template + annuel juin)', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    yearlyView.months[5] = {
      outflows: [{ id: 'y1', month: 6, label: 'Taxe', amount: 50 }],
      budgets: [],
    };
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({ initial: yearlyView, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Créer un nouveau mois', level: 1 })).toBeTruthy();
    });

    await waitFor(() => {
      const projected = readProjectedEuros();
      expect(projected).toBeCloseTo(2000 - 500 - 200 - 50, 5);
    });
  });

  it('met à jour le prévisionnel quand on change le mois (tranche annuelle différente)', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    yearlyView.months[5] = {
      outflows: [{ id: 'y1', month: 6, label: 'Juin', amount: 100 }],
      budgets: [],
    };
    yearlyView.months[6] = {
      outflows: [{ id: 'y2', month: 7, label: 'Juillet', amount: 250 }],
      budgets: [],
    };
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({ initial: yearlyView, delayMs: 0 }),
    });

    await waitFor(() => readProjectedEuros());

    const juneProjected = readProjectedEuros();
    expect(juneProjected).toBeCloseTo(2000 - 500 - 200 - 100, 5);

    const monthInput = document.querySelector('[data-new-month-date]') as HTMLInputElement;
    expect(monthInput).toBeTruthy();
    fireEvent.change(monthInput, { target: { value: '2026-07' } });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 250, 5);
    });
    expect(readProjectedEuros()).not.toBeCloseTo(juneProjected, 1);
  });

  it('affiche le placeholder sans template par défaut', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [],
        defaultForNewMonth: { template: null, pendingDebits: { outflows: [], budgets: [] } },
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(screen.getByText(/Vous n'avez pas encore créé de template par défaut/i)).toBeTruthy();
      expect(screen.getByRole('link', { name: /Ajouter un template par défaut/i })).toBeTruthy();
    });
  });

  it('sans template par défaut, le CTA mène vers la page des templates', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [],
        defaultForNewMonth: { template: null, pendingDebits: { outflows: [], budgets: [] } },
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Ajouter un template par défaut/i })).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('link', { name: /Ajouter un template par défaut/i }));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/templates');
    });
  });

  it('réinitialise le formulaire : recharge template, mois du template, inclusions et prévisionnel', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({ initial: yearlyView, delayMs: 0 }),
    });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });

    const monthInput = document.querySelector('[data-new-month-date]') as HTMLInputElement;
    expect(monthInput).toBeTruthy();
    expect(monthInput.value).toBe('2026-06');

    const chargeCb = document.querySelector(
      'input[data-new-month-include="charge"]'
    ) as HTMLInputElement;
    expect(chargeCb).toBeTruthy();
    chargeCb.checked = false;
    fireEvent.change(chargeCb);

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 200, 5);
    });

    fireEvent.change(monthInput, { target: { value: '2027-03' } });

    await waitFor(() => {
      expect(monthInput.value).toBe('2027-03');
    });

    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser le formulaire' }));

    await waitFor(() => {
      const cbAfter = document.querySelector(
        'input[data-new-month-include="charge"]'
      ) as HTMLInputElement;
      expect(cbAfter?.checked).toBe(true);
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });

    const monthAfter = document.querySelector('[data-new-month-date]') as HTMLInputElement;
    expect(monthAfter.value).toBe('2026-06');
  });

  it('crée le mois et met à jour le store (navigation budgets)', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0, createMonthDelayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate()],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByRole('button', { name: 'Créer le mois' }));

    fireEvent.click(screen.getByRole('button', { name: 'Créer le mois' }));

    await waitFor(() => {
      expect(window.location.pathname.startsWith('/budgets/')).toBe(true);
    });
  });
});
