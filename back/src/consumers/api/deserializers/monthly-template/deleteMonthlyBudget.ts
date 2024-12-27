import { DeleteMonthlyBudgetCommand } from "../../../../core/usecases/monthly-template/DeleteMonthlyBudget.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type DeleteMonthlyBudgetDeserializer = (
  params: any
) => DeleteMonthlyBudgetCommand;

const deserializer: DeleteMonthlyBudgetDeserializer = (params: any) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(params.budgetId).uuid();
  } catch (e: any) {
    throw new SerializationError("deleteMonthlyBudget", e.message);
  }

  return {
    templateId: params.templateId,
    budgetId: params.budgetId,
  };
};

export default deserializer;
