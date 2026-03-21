import type { MonthView } from './month-view.js';

export type ExpensesCheckingPayload = {
  weeklyBudgets: Array<{
    id: string;
    expenses: Array<{ id: string; isChecked: boolean }>;
  }>;
};

function cloneMonthView(month: MonthView): MonthView {
  return JSON.parse(JSON.stringify(month)) as MonthView;
}

/** Applique le toggle utilisateur sur une copie du mois (avant construction du body PUT). */
export function applyExpenseToggleToMonthView(
  month: MonthView,
  detail: { weeklyBudgetId: string; expenseId: string; isChecked: boolean },
): MonthView {
  const next = cloneMonthView(month);
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== detail.weeklyBudgetId) continue;
      const exp = b.expenses.find((e) => e.id === detail.expenseId);
      if (exp) exp.taken = detail.isChecked;
      return next;
    }
  }
  return next;
}

/** Body attendu par `PUT /months/:id/expenses/checking`. */
export function buildExpensesCheckingPayload(month: MonthView): ExpensesCheckingPayload {
  const weeklyBudgets: ExpensesCheckingPayload['weeklyBudgets'] = [];
  for (const group of month.budgetGroups) {
    for (const budget of group.budgets) {
      const wid = budget.weeklyBudgetId;
      if (wid == null || wid === '') continue;
      weeklyBudgets.push({
        id: wid,
        expenses: budget.expenses
          .filter((e): e is (typeof e) & { id: string } => Boolean(e.id))
          .map((e) => ({ id: e.id, isChecked: Boolean(e.taken) })),
      });
    }
  }
  return { weeklyBudgets };
}

/** Fusionne la réponse métier (état coché) dans une copie du mois — utile au service in-memory. */
export function applyCheckingPayloadToMonthView(
  month: MonthView,
  body: ExpensesCheckingPayload,
): MonthView {
  const next = cloneMonthView(month);
  for (const row of body.weeklyBudgets) {
    for (const g of next.budgetGroups) {
      for (const b of g.budgets) {
        if (b.weeklyBudgetId !== row.id) continue;
        for (const up of row.expenses) {
          const ex = b.expenses.find((e) => e.id === up.id);
          if (ex) ex.taken = up.isChecked;
        }
      }
    }
  }
  return next;
}
