/** Dépense rattachée à un budget (enveloppe). */
export interface BudgetExpense {
  /** Id API (requis pour PUT expenses/checking). */
  id?: string;
  icon: string;
  desc: string;
  amount: number;
  taken?: boolean;
}

export interface Budget {
  name: string;
  icon: string;
  allocated: number;
  /** Id hebdomadaire API (`account.weeklyBudgets[].id`). */
  weeklyBudgetId?: string;
  expenses: BudgetExpense[];
}

export interface BudgetGroupData {
  title: string;
  previous?: boolean;
  showAdd?: boolean;
  budgets: Budget[];
}

/** Charge récurrente (écran charges). */
export interface ChargeItemData {
  icon: string;
  label: string;
  amount: number;
  taken?: boolean;
  previous?: boolean;
}

export interface ChargeGroupData {
  title?: string;
  previous?: boolean;
  showAdd?: boolean;
  addLabel?: string;
  addTitle?: string;
  charges: ChargeItemData[];
}
