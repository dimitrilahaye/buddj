import type { YearlyOutflowsView } from './yearly-outflows-view.js';

/** Somme de toutes les charges et budgets sur l’année. */
export function sumYearlyOutflowsAnnualTotalEuros({ view }: { view: YearlyOutflowsView }): number {
  let sum = 0;
  for (const m of view.months) {
    sum += m.outflows.reduce((s, o) => s + o.amount, 0);
    sum += m.budgets.reduce((s, b) => s + b.initialBalance, 0);
  }
  return sum;
}

/** Moyenne mensuelle (comme front-v2 : total annuel / 12), arrondie à 2 décimales. */
export function yearlyAveragePerMonthEuros({ view }: { view: YearlyOutflowsView }): number {
  const total = sumYearlyOutflowsAnnualTotalEuros({ view });
  return Math.round((total / 12) * 100) / 100;
}

export function monthChargesTotalEuros({ month }: { month: YearlyOutflowsView['months'][number] }): number {
  return month.outflows.reduce((s, o) => s + o.amount, 0);
}

export function monthBudgetsTotalEuros({ month }: { month: YearlyOutflowsView['months'][number] }): number {
  return month.budgets.reduce((s, b) => s + b.initialBalance, 0);
}
