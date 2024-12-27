import ManageExpensesCheckingCommand from "../../../../core/commands/ManageExpensesCheckingCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type ManageExpensesCheckingDeserializer = (
  params: any,
  body: any
) => ManageExpensesCheckingCommand;

const deserializer: ManageExpensesCheckingDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(body.weeklyBudgets).array().notEmpty();
    body.weeklyBudgets.forEach(
      (weekly: {
        id: string;
        expenses: { id: string; isChecked: boolean }[];
      }) => {
        Koi.validate(weekly.id).uuid();
        Koi.validate(weekly.expenses).array();
        weekly.expenses.forEach((expense) => {
          Koi.validate(expense.id).uuid();
          Koi.validate(expense.isChecked).boolean();
        });
      }
    );
  } catch (e: any) {
    throw new SerializationError("manageExpensesChecking", e.message);
  }

  return {
    monthId: params.monthId,
    weeklyBudgets: body.weeklyBudgets,
  };
};

export default deserializer;
