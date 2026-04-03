import type {
  TemplateBudgetView,
  TemplateOutflowView,
  TemplateView,
} from '../application/template/template-view.js';

export type ApiTemplateOutflowPayload = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom: string | null;
};

export type ApiTemplateBudgetPayload = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance?: number;
  pendingFrom?: string | null;
};

export type ApiTemplatePayload = {
  id: string;
  name: string;
  isDefault: boolean;
  month: string;
  startingBalance: number;
  budgets: ApiTemplateBudgetPayload[];
  outflows: ApiTemplateOutflowPayload[];
};

function mapOutflow(row: ApiTemplateOutflowPayload): TemplateOutflowView {
  return {
    id: row.id,
    amount: row.amount,
    label: row.label,
    isChecked: row.isChecked,
    pendingFrom: row.pendingFrom,
  };
}

function mapBudget(row: ApiTemplateBudgetPayload): TemplateBudgetView {
  return {
    id: row.id,
    name: row.name,
    initialBalance: row.initialBalance,
    currentBalance: row.currentBalance,
    pendingFrom: row.pendingFrom,
  };
}

export function mapApiTemplatePayloadToView(row: ApiTemplatePayload): TemplateView {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.isDefault,
    month: row.month,
    startingBalance: row.startingBalance,
    budgets: (row.budgets ?? []).map(mapBudget),
    outflows: (row.outflows ?? []).map(mapOutflow),
  };
}
