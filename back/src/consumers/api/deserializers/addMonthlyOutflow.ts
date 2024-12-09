import { AddMonthlyOutflowCommand } from "../../../core/usecases/AddMonthlyOutflow.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type AddMonthlyOutflowDeserializer = (
  params: any,
  body: any
) => AddMonthlyOutflowCommand;

const deserializer: AddMonthlyOutflowDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("addMonthlyOutflow", e.message);
  }

  return {
    templateId: params.templateId,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
