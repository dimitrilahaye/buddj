import { UpdateMonthlyBudgetCommand } from "../../../../core/usecases/monthly-template/UpdateMonthlyBudget.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UpdateMonthlyBudgetDeserializer = (
  params: any,
  body: any
) => UpdateMonthlyBudgetCommand;

const deserializer: UpdateMonthlyBudgetDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(params.budgetId).uuid();
    Koi.validate(body.name).string();
    Koi.validate(body.initialBalance).number();
  } catch (e: any) {
    throw new SerializationError("updateMonthlyBudget", e.message);
  }

  return {
    templateId: params.templateId,
    budgetId: params.budgetId,
    name: body.name,
    initialBalance: body.initialBalance,
  };
};

export default deserializer;
