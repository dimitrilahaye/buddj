import type { TemplateView } from '../template/template-view.js';

/** Charge reportée (mois précédents). */
export type PendingOutflowForNewMonth = {
  id: string;
  label: string;
  amount: number;
  /** ISO */
  pendingFrom: string;
};

/** Dépense rattachée à un budget reporté (pour POST /months). */
export type PendingExpenseForNewMonth = {
  label: string;
  amount: number;
  /** ISO date */
  date: string;
};

/** Budget reporté (mois précédents). */
export type PendingBudgetForNewMonth = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  pendingFrom: string;
  expenses: PendingExpenseForNewMonth[];
};

export type DefaultNewMonthBundle = {
  template: TemplateView | null;
  pendingDebits: {
    outflows: PendingOutflowForNewMonth[];
    budgets: PendingBudgetForNewMonth[];
  };
};

export function emptyPendingDebits(): DefaultNewMonthBundle['pendingDebits'] {
  return { outflows: [], budgets: [] };
}

export type CreateMonthApiBody = {
  month: string;
  startingBalance: number;
  outflows: Array<{ label: string; amount: number; pendingFrom?: string | null }>;
  weeklyBudgets: Array<{
    name: string;
    initialBalance: number;
    pendingFrom?: string | null;
    expenses?: Array<{ label: string; amount: number; date: string }>;
  }>;
};

export type NewMonthProjectedInput = {
  startingBalanceEuros: number;
  templateCharges: Array<{ amount: number; includedInProjected: boolean }>;
  templateBudgets: Array<{ amount: number; includedInProjected: boolean }>;
  yearlyOutflows: Array<{ amount: number }>;
  yearlyBudgets: Array<{ initialBalance: number }>;
  includeYearlySectionInProjected: boolean;
  pendingOutflows: Array<{ amount: number }>;
  includePendingOutflowsSectionInProjected: boolean;
  pendingBudgets: Array<{ currentBalance: number; expenses: Array<{ amount: number }> }>;
  includePendingBudgetsSectionInProjected: boolean;
};

export function computeNewMonthProjectedBalance(input: NewMonthProjectedInput): number {
  let sub = 0;
  for (const c of input.templateCharges) {
    if (c.includedInProjected) sub += c.amount;
  }
  for (const b of input.templateBudgets) {
    if (b.includedInProjected) sub += b.amount;
  }
  if (input.includeYearlySectionInProjected) {
    for (const o of input.yearlyOutflows) sub += o.amount;
    for (const b of input.yearlyBudgets) sub += b.initialBalance;
  }
  if (input.includePendingOutflowsSectionInProjected) {
    for (const o of input.pendingOutflows) sub += o.amount;
  }
  if (input.includePendingBudgetsSectionInProjected) {
    for (const pb of input.pendingBudgets) {
      const exp = pb.expenses.reduce((s, e) => s + e.amount, 0);
      sub += pb.currentBalance + exp;
    }
  }
  return input.startingBalanceEuros - sub;
}

export function buildCreateMonthApiBody(input: {
  monthFirstDayIso: string;
  startingBalance: number;
  templateCharges: Array<{ label: string; amount: number }>;
  templateBudgets: Array<{ name: string; initialBalance: number }>;
  yearlyOutflows: Array<{ label: string; amount: number }>;
  yearlyBudgets: Array<{ name: string; initialBalance: number }>;
  pendingOutflows: Array<{ label: string; amount: number; pendingFrom: string | null }>;
  pendingBudgets: Array<{
    name: string;
    initialBalance: number;
    currentBalance: number;
    pendingFrom: string | null;
    expenses: PendingExpenseForNewMonth[];
  }>;
}): CreateMonthApiBody {
  type Wb = CreateMonthApiBody['weeklyBudgets'][number];
  return {
    month: input.monthFirstDayIso,
    startingBalance: input.startingBalance,
    outflows: [
      ...input.templateCharges.map((c) => ({ label: c.label, amount: c.amount, pendingFrom: null })),
      ...input.yearlyOutflows.map((c) => ({ label: c.label, amount: c.amount, pendingFrom: null })),
      ...input.pendingOutflows.map((c) => ({
        label: c.label,
        amount: c.amount,
        pendingFrom: c.pendingFrom,
      })),
    ],
    weeklyBudgets: [
      ...input.templateBudgets.map(
        (b): Wb => ({
          name: b.name,
          initialBalance: b.initialBalance,
          pendingFrom: null,
          expenses: [],
        })
      ),
      ...input.yearlyBudgets.map(
        (b): Wb => ({
          name: b.name,
          initialBalance: b.initialBalance,
          pendingFrom: null,
          expenses: [],
        })
      ),
      ...input.pendingBudgets.map(
        (b): Wb => ({
          name: b.name,
          initialBalance: b.initialBalance,
          pendingFrom: b.pendingFrom,
          expenses: b.expenses.map((e) => ({ label: e.label, amount: e.amount, date: e.date })),
        })
      ),
    ],
  };
}
