import DeleteExpenseCommand from "../../../../core/commands/DeleteExpenseCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type DeleteExpenseDeserializer = (params: any) => DeleteExpenseCommand;

const deserializer: DeleteExpenseDeserializer = (params: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.weeklyId).uuid();
    Koi.validate(params.expenseId).uuid();
  } catch (e: any) {
    throw new SerializationError("deleteExpense", e.message);
  }

  return {
    monthId: params.monthId,
    weeklyId: params.weeklyId,
    expenseId: params.expenseId,
  };
};

export default deserializer;
