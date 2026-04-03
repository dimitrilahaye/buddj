import type {
  DefaultNewMonthBundle,
  PendingBudgetForNewMonth,
  PendingExpenseForNewMonth,
  PendingOutflowForNewMonth,
} from '../application/new-month/default-new-month-bundle.js';
import { emptyPendingDebits } from '../application/new-month/default-new-month-bundle.js';
import { mapApiTemplatePayloadToView, type ApiTemplatePayload } from './map-api-template-to-view.js';

type ApiWeeklyExpenseLike = {
  label?: string;
  amount?: number;
  date?: string;
};

type ApiPendingBudgetLike = {
  id?: string;
  name?: string;
  initialBalance?: number;
  currentBalance?: number;
  pendingFrom?: string;
  expenses?: ApiWeeklyExpenseLike[];
};

type ApiPendingOutflowLike = {
  id?: string;
  label?: string;
  amount?: number;
  pendingFrom?: string;
};

function toIsoDate(value: unknown): string {
  if (value == null) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function mapPendingOutflow(row: ApiPendingOutflowLike): PendingOutflowForNewMonth | null {
  if (!row.id || row.label == null || row.amount == null) return null;
  return {
    id: row.id,
    label: row.label,
    amount: Number(row.amount),
    pendingFrom: toIsoDate(row.pendingFrom),
  };
}

function mapExpense(row: ApiWeeklyExpenseLike): PendingExpenseForNewMonth | null {
  if (row.label == null || row.amount == null || !row.date) return null;
  return {
    label: row.label,
    amount: Number(row.amount),
    date: toIsoDate(row.date),
  };
}

function mapPendingBudget(row: ApiPendingBudgetLike): PendingBudgetForNewMonth | null {
  if (!row.id || row.name == null || row.initialBalance == null || row.currentBalance == null) return null;
  const expenses = (row.expenses ?? []).map(mapExpense).filter((e): e is PendingExpenseForNewMonth => e != null);
  return {
    id: row.id,
    name: row.name,
    initialBalance: Number(row.initialBalance),
    currentBalance: Number(row.currentBalance),
    pendingFrom: toIsoDate(row.pendingFrom),
    expenses,
  };
}

/**
 * Réponse GET /months/template/default : { template: null } ou { template, pendingDebits }.
 */
export function mapApiDefaultNewMonthPayloadToBundle(data: unknown): DefaultNewMonthBundle {
  if (data == null || typeof data !== 'object') {
    return { template: null, pendingDebits: emptyPendingDebits() };
  }
  const o = data as Record<string, unknown>;
  if (o.template === null || o.template === undefined) {
    const pd = o.pendingDebits;
    if (pd && typeof pd === 'object') {
      const p = pd as Record<string, unknown>;
      const outflows = Array.isArray(p.outflows)
        ? p.outflows.map((x) => mapPendingOutflow(x as ApiPendingOutflowLike)).filter(Boolean)
        : [];
      const budgets = Array.isArray(p.budgets)
        ? p.budgets.map((x) => mapPendingBudget(x as ApiPendingBudgetLike)).filter(Boolean)
        : [];
      return {
        template: null,
        pendingDebits: {
          outflows: outflows as PendingOutflowForNewMonth[],
          budgets: budgets as PendingBudgetForNewMonth[],
        },
      };
    }
    return { template: null, pendingDebits: emptyPendingDebits() };
  }
  const template = mapApiTemplatePayloadToView(o.template as ApiTemplatePayload);
  const pd = o.pendingDebits;
  if (!pd || typeof pd !== 'object') {
    return { template, pendingDebits: emptyPendingDebits() };
  }
  const p = pd as Record<string, unknown>;
  const outflows = Array.isArray(p.outflows)
    ? p.outflows.map((x) => mapPendingOutflow(x as ApiPendingOutflowLike)).filter(Boolean)
    : [];
  const budgets = Array.isArray(p.budgets)
    ? p.budgets.map((x) => mapPendingBudget(x as ApiPendingBudgetLike)).filter(Boolean)
    : [];
  return {
    template,
    pendingDebits: {
      outflows: outflows as PendingOutflowForNewMonth[],
      budgets: budgets as PendingBudgetForNewMonth[],
    },
  };
}
