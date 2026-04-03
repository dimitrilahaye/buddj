/**
 * Types alignés sur l’API GET/POST/DELETE /yearly-outflows (voir back yearlyOutflowsDto).
 */

export type ApiYearlyOutflow = {
  id: string;
  month: number;
  label: string;
  amount: number;
  type: 'outflow';
};

export type ApiYearlyBudget = {
  id: string;
  month: number;
  name: string;
  initialBalance: number;
  type: 'budget';
};

export type ApiYearlyMonthSlice = {
  outflows: ApiYearlyOutflow[];
  budgets: ApiYearlyBudget[];
};

/** Objet renvoyé dans `data` : clés mois 1..12 (souvent string après JSON). */
export type ApiYearlyOutflowsPayload = Record<string, ApiYearlyMonthSlice>;
