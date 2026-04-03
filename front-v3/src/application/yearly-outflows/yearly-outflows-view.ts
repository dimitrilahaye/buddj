import type { ApiYearlyBudget, ApiYearlyOutflow, ApiYearlyOutflowsPayload } from './yearly-outflows-types.js';

export type YearlyOutflowView = {
  id: string;
  month: number;
  label: string;
  amount: number;
};

export type YearlyBudgetView = {
  id: string;
  month: number;
  name: string;
  initialBalance: number;
};

export type YearlyMonthSavingsView = {
  outflows: YearlyOutflowView[];
  budgets: YearlyBudgetView[];
};

/** 12 entrées : index 0 = janvier (month API = 1). */
export type YearlyOutflowsView = {
  months: YearlyMonthSavingsView[];
};

export function createEmptyYearlyOutflowsView(): YearlyOutflowsView {
  const months: YearlyMonthSavingsView[] = [];
  for (let i = 0; i < 12; i++) {
    months.push({ outflows: [], budgets: [] });
  }
  return { months };
}

export function mapApiYearlyOutflowsPayloadToView(payload: ApiYearlyOutflowsPayload): YearlyOutflowsView {
  const view = createEmptyYearlyOutflowsView();
  for (let apiMonth = 1; apiMonth <= 12; apiMonth++) {
    const slice = payload[String(apiMonth)];
    if (!slice) continue;
    const idx = apiMonth - 1;
    view.months[idx] = {
      outflows: slice.outflows.map((o: ApiYearlyOutflow) => ({
        id: o.id,
        month: o.month,
        label: o.label,
        amount: Number(o.amount),
      })),
      budgets: slice.budgets.map((b: ApiYearlyBudget) => ({
        id: b.id,
        month: b.month,
        name: b.name,
        initialBalance: Number(b.initialBalance),
      })),
    };
  }
  return view;
}
