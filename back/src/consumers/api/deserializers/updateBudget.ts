import { UpdateBudgetCommand } from "../../../core/usecases/UpdateBudget.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type UpdateBudgetDeserializer = (
  params: any,
  body: any
) => UpdateBudgetCommand;

const deserializer: UpdateBudgetDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.budgetId).uuid();
    Koi.validate(body.name).string();
  } catch (e: any) {
    throw new SerializationError("addBudget", e.message);
  }

  return {
    monthId: params.monthId,
    budgetId: params.budgetId,
    name: body.name,
  };
};

export default deserializer;
