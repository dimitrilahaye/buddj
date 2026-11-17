import { UpdateYearlyOutflowCommand } from "../../../../core/usecases/yearly-saving/UpdateYearlyOutflow.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UpdateYearlyOutflowDeserializer = (
  params: any,
  body: any
) => UpdateYearlyOutflowCommand;

const deserializer: UpdateYearlyOutflowDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.id).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("updateYearlyOutflow", e.message);
  }

  return {
    id: params.id,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
