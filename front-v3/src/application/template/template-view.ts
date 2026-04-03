/**
 * Vue « template mensuel » (GET/PATCH /months/template, /monthly-templates/…).
 */
export type TemplateOutflowView = {
  id: string;
  amount: number;
  label: string;
  isChecked: boolean;
  pendingFrom: string | null;
};

export type TemplateBudgetView = {
  id: string;
  name: string;
  initialBalance: number;
  currentBalance?: number;
  pendingFrom?: string | null;
};

export type TemplateView = {
  id: string;
  name: string;
  isDefault: boolean;
  /** ISO date string */
  month: string;
  startingBalance: number;
  budgets: TemplateBudgetView[];
  outflows: TemplateOutflowView[];
};
