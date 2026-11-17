import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import type { MonthView } from './month-view.js';

/**
 * Met à jour libellé / icône / montant d’une dépense (copie) — pour le service in-memory.
 * Le solde prévisionnel ne bouge pas : l’enveloppe du budget reste la même.
 */
export function updateExpenseInMonthView({
  month,
  weeklyBudgetId,
  expenseId,
  label,
  amount,
}: {
  month: MonthView;
  weeklyBudgetId: string;
  expenseId: string;
  /** Libellé API (ex. « 🔥 Kebab »). */
  label: string;
  amount: number;
}): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  const { icon, text } = splitLeadingEmoji({ label, defaultIcon: '💰' });
  for (const g of next.budgetGroups) {
    for (const b of g.budgets) {
      if (b.weeklyBudgetId !== weeklyBudgetId) continue;
      const expense = b.expenses.find((e) => e.id === expenseId);
      if (!expense) throw new Error(`Dépense introuvable : ${expenseId}`);
      expense.icon = icon;
      expense.desc = text;
      expense.amount = amount;
      return next;
    }
  }
  throw new Error(`Budget hebdo introuvable : ${weeklyBudgetId}`);
}

/**
 * Met à jour libellé / icône / montant d’une charge (copie) — pour le service in-memory.
 * Une charge non prélevée pèse sur le solde prévisionnel : on y reporte l’écart de montant.
 */
export function updateOutflowInMonthView({
  month,
  outflowId,
  label,
  amount,
}: {
  month: MonthView;
  outflowId: string;
  /** Libellé API (ex. « 🔥 EDF »). */
  label: string;
  amount: number;
}): MonthView {
  const next = JSON.parse(JSON.stringify(month)) as MonthView;
  const { icon, text } = splitLeadingEmoji({ label, defaultIcon: '💰' });
  let found = false;
  for (const g of next.chargeGroups ?? []) {
    for (const c of g.charges) {
      if (c.id !== outflowId) continue;
      found = true;
      if (!c.taken) next.projectedBalance = round2(next.projectedBalance - (amount - c.amount));
      c.icon = icon;
      c.label = text;
      c.amount = amount;
    }
  }
  for (const o of next.outflows ?? []) {
    if (o.id !== outflowId) continue;
    found = true;
    o.label = label;
    o.amount = amount;
  }
  if (!found) throw new Error(`Charge introuvable : ${outflowId}`);
  return next;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
