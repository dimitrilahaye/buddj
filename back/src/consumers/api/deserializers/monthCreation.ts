import MonthCreationCommand, {
  OutflowCreationCommand,
  WeeklyBudgetCreationCommand,
} from "../../../core/commands/MonthCreationCommand.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";
import PendingDebit, {
  PendingDebitProps,
} from "../../../core/models/pending-debit/PendingDebit.js";

export type MonthCreationDeserializer = (body: any) => MonthCreationCommand;

const deserializer: MonthCreationDeserializer = (body: any) => {
  try {
    Koi.validate(body.month).date();
    Koi.validate(body.startingBalance).number();
    Koi.validate(body.outflows).array().notEmpty();
    Koi.validate(body.weeklyBudgets).array().notEmpty();
    Koi.validate(body.pendingDebits).array();
    body.outflows.forEach((outflow: OutflowCreationCommand) => {
      Koi.validate(outflow.amount).number();
      Koi.validate(outflow.label).string().notEmpty();
    });
    body.weeklyBudgets.forEach((weeklyBudget: WeeklyBudgetCreationCommand) => {
      Koi.validate(weeklyBudget.initialBalance).number();
      Koi.validate(weeklyBudget.name).string().notEmpty();
    });
    body.pendingDebits.forEach((pendingDebit: PendingDebit) => {
      Koi.validate(pendingDebit.id).uuid();
      Koi.validate(pendingDebit.monthId).uuid();
      Koi.validate(pendingDebit.monthDate).date();
      Koi.validate(pendingDebit.type).oneOf("outflow", "expense");
      Koi.validate(pendingDebit.amount).number();
      Koi.validate(pendingDebit.label).string().notEmpty();
    });
  } catch (e: any) {
    throw new SerializationError("monthCreation", e.message);
  }

  return {
    date: body.month,
    initialBalance: body.startingBalance,
    outflows: body.outflows.map((outflow: OutflowCreationCommand) => ({
      label: outflow.label,
      amount: outflow.amount,
    })),
    weeklyBudgets: body.weeklyBudgets.map(
      (weeklyBudget: WeeklyBudgetCreationCommand) => ({
        name: weeklyBudget.name,
        initialBalance: weeklyBudget.initialBalance,
      })
    ),
    pendingDebits: body.pendingDebits.map(
      (pendingDebit: PendingDebitProps) => ({
        id: pendingDebit.id,
        monthId: pendingDebit.monthId,
        monthDate: pendingDebit.monthDate,
        label: pendingDebit.label,
        amount: pendingDebit.amount,
        type: pendingDebit.type,
      })
    ),
  };
};

export default deserializer;
