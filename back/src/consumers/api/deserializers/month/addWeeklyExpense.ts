import AddWeeklyExpenseCommand from "../../../../core/commands/AddWeeklyExpenseCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type AddWeeklyExpenseDeserializer = (
  params: any,
  body: any
) => AddWeeklyExpenseCommand;

const deserializer: AddWeeklyExpenseDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.weekId).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("addWeeklyExpense", e.message);
  }

  return {
    monthId: params.monthId,
    weeklyBudgetId: params.weekId,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
