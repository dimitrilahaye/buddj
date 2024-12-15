import { AddBudgetCommand } from "../../../core/usecases/AddBudget.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type AddBudgetDeserializer = (
  params: any,
  body: any
) => AddBudgetCommand;

const deserializer: AddBudgetDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(body.name).string();
    Koi.validate(body.initialBalance).number();
  } catch (e: any) {
    throw new SerializationError("addBudget", e.message);
  }

  return {
    monthId: params.monthId,
    name: body.name,
    initialBalance: body.initialBalance,
  };
};

export default deserializer;
