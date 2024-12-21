import MonthCreationCommand, {
  OutflowCreationCommand,
  BudgetCreationCommand,
} from "../../../core/commands/MonthCreationCommand.js";
import { monthCreationSchema, validSchema } from "../schemas.js";

export type MonthCreationDeserializer = (body: any) => MonthCreationCommand;

const deserializer: MonthCreationDeserializer = (body: any) => {
  const data = validSchema(monthCreationSchema, body);

  return {
    date: data.month,
    initialBalance: data.startingBalance,
    outflows: data.outflows.map((outflow: OutflowCreationCommand) => ({
      label: outflow.label,
      amount: outflow.amount,
    })),
    weeklyBudgets: data.weeklyBudgets.map(
      (weeklyBudget: BudgetCreationCommand) => ({
        name: weeklyBudget.name,
        initialBalance: weeklyBudget.initialBalance,
        expenses: weeklyBudget.expenses,
      })
    ),
  };
};

export default deserializer;
