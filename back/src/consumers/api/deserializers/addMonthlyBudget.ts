import { AddMonthlyBudgetCommand } from "../../../core/usecases/AddMonthlyBudget.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type AddMonthlyBudgetDeserializer = (
  params: any,
  body: any
) => AddMonthlyBudgetCommand;

const deserializer: AddMonthlyBudgetDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(body.name).string();
    Koi.validate(body.initialBalance).number();
  } catch (e: any) {
    throw new SerializationError("addMonthlyBudget", e.message);
  }

  return {
    templateId: params.templateId,
    name: body.name,
    initialBalance: body.initialBalance,
  };
};

export default deserializer;
