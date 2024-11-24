import { AddYearlyOutflowCommand } from "../../../core/usecases/AddYearlyOutflow.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type AddYearlyOutflowDeserializer = (
  body: any
) => AddYearlyOutflowCommand;

const deserializer: AddYearlyOutflowDeserializer = (body: any) => {
  try {
    Koi.validate(body.id).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
    Koi.validate(body.month).number();
  } catch (e: any) {
    throw new SerializationError("addYearlyOutflow", e.message);
  }

  return {
    id: body.id,
    label: body.label,
    amount: body.amount,
    month: body.month,
  };
};

export default deserializer;
