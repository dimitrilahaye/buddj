import { describe, it, expect } from 'vitest';
import { computeNewMonthProjectedBalance } from '../../src/application/new-month/default-new-month-bundle.js';

describe('computeNewMonthProjectedBalance', () => {
  const base = (): Parameters<typeof computeNewMonthProjectedBalance>[0] => ({
    startingBalanceEuros: 1000,
    templateCharges: [{ amount: 100, includedInProjected: true }],
    templateBudgets: [{ amount: 50, includedInProjected: true }],
    yearlyOutflows: [{ amount: 20 }],
    yearlyBudgets: [{ initialBalance: 30 }],
    includeYearlySectionInProjected: true,
    pendingOutflows: [{ amount: 10 }],
    includePendingOutflowsSectionInProjected: true,
    pendingBudgets: [{ currentBalance: 5, expenses: [{ amount: 3 }] }],
    includePendingBudgetsSectionInProjected: true,
  });

  it('soustrait charges et budgets template inclus', () => {
    const p = computeNewMonthProjectedBalance(base());
    expect(p).toBe(1000 - 100 - 50 - 20 - 30 - 10 - 8);
  });

  it('ignore une charge template exclue du prévisionnel', () => {
    const input = base();
    input.templateCharges = [
      { amount: 100, includedInProjected: false },
      { amount: 40, includedInProjected: true },
    ];
    expect(computeNewMonthProjectedBalance(input)).toBe(1000 - 40 - 50 - 20 - 30 - 10 - 8);
  });

  it('réagit au solde initial', () => {
    const input = base();
    input.startingBalanceEuros = 500;
    expect(computeNewMonthProjectedBalance(input)).toBe(500 - 100 - 50 - 20 - 30 - 10 - 8);
  });

  it('exclut la section annuelle du prévisionnel si désactivée', () => {
    const input = base();
    input.includeYearlySectionInProjected = false;
    expect(computeNewMonthProjectedBalance(input)).toBe(1000 - 100 - 50 - 10 - 8);
  });

  it('budget reporté : currentBalance + somme des dépenses', () => {
    const input = base();
    input.pendingBudgets = [{ currentBalance: 10, expenses: [{ amount: 2 }, { amount: 3 }] }];
    expect(computeNewMonthProjectedBalance(input)).toBe(1000 - 100 - 50 - 20 - 30 - 10 - 15);
  });
});
