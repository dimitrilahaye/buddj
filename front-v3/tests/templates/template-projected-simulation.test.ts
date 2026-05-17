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

function templateDetailMain(): HTMLElement {
  const heading = screen.getByRole('heading', { name: '📆 Modèle test', level: 1 });
  const main = heading.closest('main');
  expect(main).toBeTruthy();
  return main as HTMLElement;
}

function projectedAmount({ main, amount }: { main: HTMLElement; amount: string }): HTMLElement {
  return within(projectedSticky({ main })).getByText(amount);
}

function projectedSticky({ main }: { main: HTMLElement }): HTMLElement {
  const label = within(main).getByText('Total charges et budgets');
  const sticky = label.parentElement;
  expect(sticky).toBeTruthy();
  return sticky as HTMLElement;
}

function readProjectedEuros({ main }: { main: HTMLElement }): number {
  const sticky = projectedSticky({ main });
  const amountMatch = sticky.textContent?.match(/([\d\s\u202f]+,\d{2})\s*€/);
  expect(amountMatch).toBeTruthy();
  return parseEurosToNumber(amountMatch![0] ?? '');
}

function simulationCheckbox({ main }: { main: HTMLElement }): HTMLInputElement {
  return within(main).getByRole('checkbox', {
    name: 'Exclure du total projeté',
  }) as HTMLInputElement;
}

describe('détail template — simulation inclusion (checkbox)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('met à jour le total, la session de simulation et le bouton Terminer la simulation', async () => {
    shellDocument();
    window.history.replaceState(null, '', `/templates/${TEMPLATE_ID}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({ templates: [seedTemplate()], delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });

    const main = templateDetailMain();
    expect(readProjectedEuros({ main })).toBeCloseTo(150, 5);

    expect(projectedAmount({ main, amount: formatEuros(150) }).textContent?.trim()).toBe(formatEuros(150));
    expect(screen.queryByRole('button', { name: 'Terminer la simulation' })).toBeNull();

    const chargeCb = simulationCheckbox({ main });
    expect(chargeCb.checked).toBe(false);

    chargeCb.checked = true;
    fireEvent.change(chargeCb);

    await waitFor(() => {
      expect(readProjectedEuros({ main })).toBeCloseTo(50, 5);
    });
    expect(projectedAmount({ main, amount: formatEuros(50) }).textContent?.trim()).toBe(formatEuros(50));
    expect(screen.getByRole('button', { name: 'Terminer la simulation' })).toBeTruthy();
    expect(chargeCb.checked).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Terminer la simulation' }));

    await waitFor(() => {
      expect(readProjectedEuros({ main })).toBeCloseTo(150, 5);
    });
    expect(projectedAmount({ main, amount: formatEuros(150) }).textContent?.trim()).toBe(formatEuros(150));
    expect(chargeCb.checked).toBe(false);
    expect(screen.queryByRole('button', { name: 'Terminer la simulation' })).toBeNull();
  });

  it('garde le bouton Terminer la simulation tant que la session n’est pas terminée', async () => {
    shellDocument();
    window.history.replaceState(null, '', `/templates/${TEMPLATE_ID}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({ templates: [seedTemplate()], delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });

    const main = templateDetailMain();
    const chargeCb = simulationCheckbox({ main });
    chargeCb.checked = true;
    fireEvent.change(chargeCb);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Terminer la simulation' })).toBeTruthy();
    });

    chargeCb.checked = false;
    fireEvent.change(chargeCb);
    await waitFor(() => {
      expect(readProjectedEuros({ main })).toBeCloseTo(150, 5);
    });
    expect(screen.getByRole('button', { name: 'Terminer la simulation' })).toBeTruthy();
  });

  it('exclut un budget du total simulé', async () => {
    shellDocument();
    window.history.replaceState(null, '', `/templates/${TEMPLATE_ID}`);
    bootstrap({
      authService: createAuthServiceFromInMemory(true),
      monthService: createMonthServiceFromInMemory({ months: [], delayMs: 0 }),
      templateService: createTemplateServiceFromInMemory({ templates: [seedTemplate()], delayMs: 0 }),
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '📆 Modèle test', level: 1 })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Budgets' }));

    const main = templateDetailMain();
    const budgetCb = simulationCheckbox({ main });
    budgetCb.checked = true;
    fireEvent.change(budgetCb);

    await waitFor(() => {
      expect(readProjectedEuros({ main })).toBeCloseTo(100, 5);
    });
  });
});
