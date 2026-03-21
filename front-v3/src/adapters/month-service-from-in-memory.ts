import { applyCheckingPayloadToMonthView } from '../application/month/expenses-checking-payload.js';
import type { MonthService } from '../application/month/month-service.js';
import type { MonthView } from '../application/month/month-view.js';
import { removeBudgetFromMonthView } from '../application/month/remove-budget-from-month-view.js';
import { removeExpenseFromMonthView } from '../application/month/remove-expense-from-month-view.js';

function deepCloneMonths(source: MonthView[]): MonthView[] {
  return JSON.parse(JSON.stringify(source)) as MonthView[];
}

/**
 * État mutable en closure : `getUnarchivedMonths`, `putExpensesChecking` et `deleteExpense` partagent les mêmes mois.
 */
export function createMonthServiceFromInMemory({
  months: initialMonths,
  delayMs = 0,
  putDelayMs,
  deleteDelayMs,
  deleteBudgetDelayMs,
}: {
  months: MonthView[];
  /** Délai simulé pour `getUnarchivedMonths`. */
  delayMs?: number;
  /** Délai simulé pour `putExpensesChecking` (défaut : `delayMs`). */
  putDelayMs?: number;
  /** Délai simulé pour `deleteExpense` (défaut : `delayMs`). */
  deleteDelayMs?: number;
  /** Délai simulé pour `deleteBudget` (défaut : `delayMs`). */
  deleteBudgetDelayMs?: number;
}): MonthService {
  let months = deepCloneMonths(initialMonths);
  const waitPut = putDelayMs ?? delayMs;
  const waitDelete = deleteDelayMs ?? delayMs;
  const waitDeleteBudget = deleteBudgetDelayMs ?? delayMs;
  return {
    async getUnarchivedMonths() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return deepCloneMonths(months);
    },
    async putExpensesChecking(monthId, body) {
      if (waitPut > 0) await new Promise((r) => setTimeout(r, waitPut));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = applyCheckingPayloadToMonthView(months[idx], body);
      // Simule un solde prévisionnel recalculé côté serveur (ex. dashboard.account.forecastBalance)
      updated.projectedBalance = Math.round((updated.projectedBalance + 73.6) * 10) / 10;
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async deleteExpense({ monthId, weeklyBudgetId, expenseId }) {
      if (waitDelete > 0) await new Promise((r) => setTimeout(r, waitDelete));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const updated = removeExpenseFromMonthView(months[idx], weeklyBudgetId, expenseId);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
    async deleteBudget({ monthId, budgetId }) {
      if (waitDeleteBudget > 0) await new Promise((r) => setTimeout(r, waitDeleteBudget));
      const idx = months.findIndex((m) => m.id === monthId);
      if (idx < 0) throw new Error(`Mois introuvable : ${monthId}`);
      const month = months[idx];
      if (weeklyBudgetHasUncheckedExpense(month, budgetId)) {
        throw new Error('Vous ne pouvez pas supprimer ce budget');
      }
      const updated = removeBudgetFromMonthView(month, budgetId);
      months[idx] = updated;
      return deepCloneMonths([updated])[0]!;
    },
  };
}

function weeklyBudgetHasUncheckedExpense(month: MonthView, weeklyBudgetId: string): boolean {
  for (const g of month.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== weeklyBudgetId) continue;
      return b.expenses.some((e) => !e.taken);
    }
  }
  return false;
}
