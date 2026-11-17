import { UpdateOutflowCommand } from "../../../../core/usecases/month/UpdateOutflow.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UpdateOutflowDeserializer = (
  params: any,
  body: any
) => UpdateOutflowCommand;

const deserializer: UpdateOutflowDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.outflowId).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("updateOutflow", e.message);
  }

  return {
    monthId: params.monthId,
    outflowId: params.outflowId,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
