import MonthCreationCommand from "../../../core/commands/MonthCreationCommand.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";
import {
  OutflowCreationCommand,
  WeeklyBudgetCreationCommand,
} from "../../../core/commands/MonthCreationCommand.js";

export type MonthCreationDeserializer = (body: any) => MonthCreationCommand;

const deserializer: MonthCreationDeserializer = (body: any) => {
  try {
    Koi.validate(body.month).date();
    Koi.validate(body.startingBalance).number();
    Koi.validate(body.outflows).array().notEmpty();
    Koi.validate(body.weeklyBudgets).array().notEmpty();
    body.outflows.forEach((outflow: OutflowCreationCommand) => {
      Koi.validate(outflow.amount).number();
      Koi.validate(outflow.label).string().notEmpty();
    });
    body.weeklyBudgets.forEach((weeklyBudget: WeeklyBudgetCreationCommand) => {
      Koi.validate(weeklyBudget.initialBalance).number();
      Koi.validate(weeklyBudget.name).string().notEmpty();
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
  };
};

export default deserializer;
