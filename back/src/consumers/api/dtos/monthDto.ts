import Month from "../../../core/models/month/Month.js";

export type MonthDto = {
  id: string;
  date: Date;
  dashboard: {
    account: {
      currentBalance: number;
      forecastBalance: number;
    };
    weeks: {
      weeklyBudgets: Array<{
        weekName: string;
        currentBalance: number;
      }>;
      forecastBalance: number;
    };
  };
  account: {
    id: string;
    currentBalance: number;
    outflows: Array<{
      id: string;
      amount: number;
      label: string;
      isChecked: boolean;
      pendingFrom: Date | null;
    }>;
    weeklyBudgets: Array<{
      id: string;
      name: string;
      pendingFrom: Date | null;
      expenses: Array<{
        id: string;
        amount: number;
        label: string;
        isChecked: boolean;
      }>;
    }>;
  };
};

export type MonthDtoBuilder = (month: Month) => MonthDto;

export default function monthDto(month: Month): MonthDto {
  return {
    id: month.id,
    date: month.date,
    dashboard: month.dashboard(),
    account: {
      id: month.account.id,
      currentBalance: month.account.currentBalance,
      outflows: month.account.outflows.map((outflow) => ({
        id: outflow.id,
        amount: outflow.amount,
        label: outflow.label,
        isChecked: outflow.isChecked,
        pendingFrom: outflow.pendingFrom,
      })),
      weeklyBudgets: month.account.weeklyBudgets.map((weeklyBudget) => ({
        id: weeklyBudget.id,
        name: weeklyBudget.name,
        pendingFrom: weeklyBudget.pendingFrom,
        expenses: weeklyBudget.expenses.map((expense) => ({
          id: expense.id,
          amount: expense.amount,
          label: expense.label,
          isChecked: expense.isChecked,
        })),
      })),
    },
  };
}
