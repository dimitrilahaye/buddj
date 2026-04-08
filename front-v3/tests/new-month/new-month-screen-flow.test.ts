import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent, within } from '@testing-library/dom';
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

function seedTemplate({
  startingBalance = 2000,
}: {
  startingBalance?: number;
} = {}): TemplateView {
  return {
    id: TEMPLATE_ID,
    name: 'Défaut',
    isDefault: true,
    month: '2026-06-01T00:00:00.000Z',
    startingBalance,
    outflows: [{ id: 'o1', label: '🔥 Loyer', amount: 500, isChecked: false, pendingFrom: null }],
    budgets: [{ id: 'wb1', name: '🎯 Courses', initialBalance: 200, pendingFrom: null }],
  };
}

function readProjectedEuros(): number {
  const el = document.querySelector('[data-new-month-projected]');
  expect(el).toBeTruthy();
  return parseEurosToNumber(el!.textContent ?? '');
}

function getStepSection({
  heading,
}: {
  heading: string;
}): HTMLElement {
  const title = screen.getByRole('heading', { name: heading, level: 2, hidden: true });
  const section = title.closest('section') as HTMLElement | null;
  expect(section).not.toBeNull();
  if (!section) throw new Error(`Section introuvable pour "${heading}"`);
  return section;
}

/** Sous-bloc (h3) dans une étape du formulaire « nouveau mois », ex. charges / budgets reportés. */
function getNewMonthSubsectionByTitle({
  stepSection,
  title,
}: {
  stepSection: HTMLElement;
  title: string;
}): HTMLElement {
  const h3 = within(stepSection).getByRole('heading', { name: title, level: 3, hidden: true });
  const subsection = h3.closest('section');
  expect(subsection).not.toBeNull();
  if (!subsection) throw new Error(`Sous-section introuvable pour « ${title} »`);
  return subsection as HTMLElement;
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
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));

    await waitFor(() => {
      expect(window.location.pathname.startsWith('/budgets/')).toBe(true);
    });
  });

  it('bloque le passage à l’étape 2 si le solde initial est à 0 € (toast + étape 2 cachée)', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 0 })],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByRole('button', { name: 'Suivant' }));
    const step2Title = screen.getByRole('heading', {
      name: '2. Charges et budgets template',
      level: 2,
      hidden: true,
    });
    const step2 = step2Title.closest('section') as HTMLElement | null;
    expect(step2).not.toBeNull();
    if (!step2) throw new Error('La step 2 est introuvable');
    expect(step2.hidden).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    await waitFor(() => {
      const toast = screen.getByRole('status', {
        name: /solde initial supérieur à 0 €/i,
      });
      expect(toast).toBeTruthy();
    });
    expect(step2.hidden).toBe(true);
  });

  it('autorise le passage à l’étape 2 si le solde initial est supérieur à 0 €', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));

    await waitFor(() => {
      const step2Title = screen.getByRole('heading', {
        name: '2. Charges et budgets template',
        level: 2,
        hidden: true,
      });
      const step2 = step2Title.closest('section') as HTMLElement | null;
      expect(step2).not.toBeNull();
      if (!step2) throw new Error('La step 2 est introuvable');
      expect(step2.hidden).toBe(false);
    });
  });

  it('affiche les placeholders pour annuels et mois précédents quand les données sont vides', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() => {
      expect(
        getStepSection({
          heading: '2. Charges et budgets template',
        }).hidden
      ).toBe(false);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() => {
      expect(
        getStepSection({
          heading: '3. Charges et budgets annuels',
        }).hidden
      ).toBe(false);
    });

    expect(screen.getByText(/Aucune charge annuelle trouvée pour ce mois/i)).toBeTruthy();
    expect(screen.getByText(/Aucun budget annuel trouvé pour ce mois/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() => {
      expect(
        getStepSection({
          heading: '4. Charges et budgets des mois précédents',
        }).hidden
      ).toBe(false);
    });

    expect(screen.getByText(/Aucune charge reportée des mois précédents/i)).toBeTruthy();
    expect(screen.getByText(/Aucun budget reporté des mois précédents/i)).toBeTruthy();
  });

  it('toggle Inclus/Exclus annuel et mois précédents met à jour le prévisionnel', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    yearlyView.months[5] = {
      outflows: [{ id: 'y1', month: 6, label: 'Taxe', amount: 100 }],
      budgets: [{ id: 'yb1', month: 6, name: 'Vacances', initialBalance: 300 }],
    };
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        defaultForNewMonth: {
          template: seedTemplate({ startingBalance: 2000 }),
          pendingDebits: {
            outflows: [{ id: 'po1', label: 'Retard', amount: 70, pendingFrom: '2026-05-01T00:00:00.000Z' }],
            budgets: [
              {
                id: 'pb1',
                name: '🎯 Santé',
                initialBalance: 100,
                currentBalance: 30,
                pendingFrom: '2026-05-01T00:00:00.000Z',
                expenses: [{ amount: 20, label: 'Pharmacie', date: '2026-05-15T00:00:00.000Z' }],
              },
            ],
          },
        },
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: yearlyView,
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 100 - 300 - 70 - 50, 5);
    });

    const yearlyChargesBtn = document.querySelector(
      'button[data-rappel-section="annuel-charges"]'
    ) as HTMLButtonElement;
    expect(yearlyChargesBtn).toBeTruthy();
    fireEvent.click(yearlyChargesBtn);
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 300 - 70 - 50, 5);
    });

    const yearlyBudgetsBtn = document.querySelector(
      'button[data-rappel-section="annuel-budgets"]'
    ) as HTMLButtonElement;
    expect(yearlyBudgetsBtn).toBeTruthy();
    fireEvent.click(yearlyBudgetsBtn);
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 70 - 50, 5);
    });

    const pendingChargesBtn = document.querySelector(
      'button[data-rappel-section="charges"]'
    ) as HTMLButtonElement;
    expect(pendingChargesBtn).toBeTruthy();
    fireEvent.click(pendingChargesBtn);
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 50, 5);
    });

    const pendingBudgetsBtn = document.querySelector(
      'button[data-rappel-section="budgets"]'
    ) as HTMLButtonElement;
    expect(pendingBudgetsBtn).toBeTruthy();
    fireEvent.click(pendingBudgetsBtn);
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200, 5);
    });
  });

  it('supprime en masse annuels et reports après confirmation et met à jour le prévisionnel', async () => {
    shellDocument();
    const yearlyView = createEmptyYearlyOutflowsView();
    yearlyView.months[5] = {
      outflows: [{ id: 'y1', month: 6, label: 'Taxe', amount: 100 }],
      budgets: [{ id: 'yb1', month: 6, name: 'Vacances', initialBalance: 300 }],
    };
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        defaultForNewMonth: {
          template: seedTemplate({ startingBalance: 2000 }),
          pendingDebits: {
            outflows: [{ id: 'po1', label: 'Retard', amount: 70, pendingFrom: '2026-05-01T00:00:00.000Z' }],
            budgets: [
              {
                id: 'pb1',
                name: '🎯 Santé',
                initialBalance: 100,
                currentBalance: 30,
                pendingFrom: '2026-05-01T00:00:00.000Z',
                expenses: [{ amount: 20, label: 'Pharmacie', date: '2026-05-15T00:00:00.000Z' }],
              },
            ],
          },
        },
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: yearlyView,
        delayMs: 0,
      }),
    });

    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 100 - 300 - 70 - 50, 5);
    });

    const yearlyChargesSection = getStepSection({
      heading: '3. Charges et budgets annuels',
    }).querySelector('.new-month-section--rappel-annuel') as HTMLElement;
    expect(yearlyChargesSection).toBeTruthy();
    const yearlyChargesDeleteAllBtn = within(yearlyChargesSection).getByRole('button', {
      name: 'Supprimer toutes les charges annuelles',
      hidden: true,
    }) as HTMLButtonElement;
    fireEvent.click(yearlyChargesDeleteAllBtn);
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 300 - 70 - 50, 5);
    });

    const yearlyBudgetSections = getStepSection({
      heading: '3. Charges et budgets annuels',
    }).querySelectorAll('.new-month-section--rappel-annuel');
    const yearlyBudgetsSection = yearlyBudgetSections[1] as HTMLElement;
    expect(yearlyBudgetsSection).toBeTruthy();
    const yearlyBudgetsDeleteAllBtn = within(yearlyBudgetsSection).getByRole('button', {
      name: 'Supprimer tous les budgets annuels',
      hidden: true,
    }) as HTMLButtonElement;
    fireEvent.click(yearlyBudgetsDeleteAllBtn);
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 70 - 50, 5);
    });

    const step4 = getStepSection({
      heading: '4. Charges et budgets des mois précédents',
    });
    const pendingChargesSection = getNewMonthSubsectionByTitle({
      stepSection: step4,
      title: 'Charges des mois précédents',
    });
    const pendingChargesDeleteAllBtn = within(pendingChargesSection).getByRole('button', {
      name: 'Supprimer toutes les charges des mois précédents',
      hidden: true,
    }) as HTMLButtonElement;
    fireEvent.click(pendingChargesDeleteAllBtn);
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 50, 5);
    });

    const pendingBudgetsSection = getNewMonthSubsectionByTitle({
      stepSection: step4,
      title: 'Budgets des mois précédents',
    });
    const pendingBudgetsDeleteAllBtn = within(pendingBudgetsSection).getByRole('button', {
      name: 'Aucun budget supprimable : chaque budget a encore des dépenses en attente',
      hidden: true,
    }) as HTMLButtonElement;
    expect(pendingBudgetsDeleteAllBtn.disabled).toBe(true);
    await waitFor(() => {
      expect(readProjectedEuros()).toBeCloseTo(2000 - 500 - 200 - 50, 5);
    });
  });

  it('Supprimer tout sur les budgets reportés ne retire que ceux sans dépenses en attente', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        defaultForNewMonth: {
          template: seedTemplate({ startingBalance: 2000 }),
          pendingDebits: {
            outflows: [],
            budgets: [
              {
                id: 'pb1',
                name: 'Avec attente',
                initialBalance: 100,
                currentBalance: 30,
                pendingFrom: '2026-05-01T00:00:00.000Z',
                expenses: [{ amount: 20, label: 'X', date: '2026-05-15T00:00:00.000Z' }],
              },
              {
                id: 'pb2',
                name: 'Sans attente',
                initialBalance: 40,
                currentBalance: 40,
                pendingFrom: '2026-05-01T00:00:00.000Z',
                expenses: [],
              },
            ],
          },
        },
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => readProjectedEuros());
    const step4 = getStepSection({ heading: '4. Charges et budgets des mois précédents' });
    const pendingBudgetsSection = getNewMonthSubsectionByTitle({
      stepSection: step4,
      title: 'Budgets des mois précédents',
    });
    const deleteAllBtn = within(pendingBudgetsSection).getByRole('button', {
      name: 'Supprimer tous les budgets des mois précédents',
      hidden: true,
    }) as HTMLButtonElement;
    expect(deleteAllBtn.disabled).toBe(false);
    fireEvent.click(deleteAllBtn);
    await waitFor(() => screen.getByRole('button', { name: 'Confirmer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmer' }));
    await waitFor(() => {
      expect(screen.getByText('Avec attente')).toBeTruthy();
      expect(screen.queryByText('Sans attente')).toBeNull();
    });
  });

  it('les boutons du stepper sont disabled/enabled selon les étapes dévoilées et permettent la navigation', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByLabelText('Étape 1'));
    const step1Btn = screen.getByLabelText('Étape 1') as HTMLButtonElement;
    const step2Btn = screen.getByLabelText('Étape 2') as HTMLButtonElement;
    const step3Btn = screen.getByLabelText('Étape 3') as HTMLButtonElement;
    expect(step1Btn.disabled).toBe(false);
    expect(step2Btn.disabled).toBe(true);
    expect(step3Btn.disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() => {
      const refreshedStep2 = screen.getByLabelText('Étape 2') as HTMLButtonElement;
      expect(refreshedStep2.disabled).toBe(false);
    });

    const refreshedStep1 = screen.getByLabelText('Étape 1');
    fireEvent.click(refreshedStep1);
    await waitFor(() => {
      const step1Section = getStepSection({
        heading: '1. Mois et solde initial',
      });
      expect(step1Section.className).toContain('new-month-step--active');
    });
  });

  it('clic sur une pastille d’étape déclenche un scroll vers le h2 ciblé', async () => {
    shellDocument();
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({
        templates: [seedTemplate({ startingBalance: 2000 })],
        delayMs: 0,
      }),
      yearlyOutflowsService: createYearlyOutflowsServiceFromInMemory({
        initial: createEmptyYearlyOutflowsView(),
        delayMs: 0,
      }),
    });

    await waitFor(() => screen.getByRole('button', { name: 'Suivant' }));
    fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
    await waitFor(() => {
      expect((screen.getByLabelText('Étape 2') as HTMLButtonElement).disabled).toBe(false);
    });

    let scrollCalled = false;
    const originalScrollTo = HTMLElement.prototype.scrollTo;
    HTMLElement.prototype.scrollTo = () => {
      scrollCalled = true;
    };
    const previousRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    }) as typeof window.requestAnimationFrame;

    fireEvent.click(screen.getByLabelText('Étape 1'));

    await waitFor(() => {
      expect(scrollCalled).toBe(true);
    });
    HTMLElement.prototype.scrollTo = originalScrollTo;
    window.requestAnimationFrame = previousRaf;
  });
});
