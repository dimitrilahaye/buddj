import { UpdateMonthlyOutflowCommand } from "../../../../core/usecases/monthly-template/UpdateMonthlyOutflow.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UpdateMonthlyOutflowDeserializer = (
  params: any,
  body: any
) => UpdateMonthlyOutflowCommand;

const deserializer: UpdateMonthlyOutflowDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(params.outflowId).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("updateMonthlyOutflow", e.message);
  }

  return {
    templateId: params.templateId,
    outflowId: params.outflowId,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
