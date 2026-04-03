import { describe, it, expect } from 'vitest';
import { createEmptyYearlyOutflowsView, type YearlyOutflowsView } from '../../src/application/yearly-outflows/yearly-outflows-view.js';
import {
  monthBudgetsTotalEuros,
  monthChargesTotalEuros,
  sumYearlyOutflowsAnnualTotalEuros,
  yearlyAveragePerMonthEuros,
} from '../../src/application/yearly-outflows/yearly-totals.js';

function viewWith(
  patches: Partial<{ monthIndex: number; chargeAmount: number; budgetBalance: number }>[],
): YearlyOutflowsView {
  const v = createEmptyYearlyOutflowsView();
  let id = 0;
  for (const p of patches) {
    const i = p.monthIndex ?? 0;
    if (p.chargeAmount != null) {
      v.months[i]!.outflows.push({
        id: `o-${id++}`,
        month: i + 1,
        label: 'C',
        amount: p.chargeAmount,
      });
    }
    if (p.budgetBalance != null) {
      v.months[i]!.budgets.push({
        id: `b-${id++}`,
        month: i + 1,
        name: 'B',
        initialBalance: p.budgetBalance,
      });
    }
  }
  return v;
}

describe('yearly-totals', () => {
  it('somme annuelle et moyenne / 12', () => {
    const view = viewWith([
      { monthIndex: 0, chargeAmount: 120 },
      { monthIndex: 1, budgetBalance: 240 },
    ]);
    expect(sumYearlyOutflowsAnnualTotalEuros({ view })).toBe(360);
    expect(yearlyAveragePerMonthEuros({ view })).toBe(30);
  });

  it('recalcule après ajouts sur plusieurs mois', () => {
    let view = createEmptyYearlyOutflowsView();
    expect(yearlyAveragePerMonthEuros({ view })).toBe(0);
    view = viewWith([{ monthIndex: 5, chargeAmount: 60 }]);
    expect(monthChargesTotalEuros({ month: view.months[5]! })).toBe(60);
    expect(yearlyAveragePerMonthEuros({ view })).toBe(5);
    const view2 = viewWith([
      { monthIndex: 5, chargeAmount: 60 },
      { monthIndex: 5, budgetBalance: 60 },
    ]);
    expect(monthBudgetsTotalEuros({ month: view2.months[5]! })).toBe(60);
    expect(yearlyAveragePerMonthEuros({ view: view2 })).toBe(10);
  });
});
