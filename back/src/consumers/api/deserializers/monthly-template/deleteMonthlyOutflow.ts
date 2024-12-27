import { DeleteMonthlyOutflowCommand } from "../../../../core/usecases/monthly-template/DeleteMonthlyOutflow.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type DeleteMonthlyOutflowDeserializer = (
  params: any
) => DeleteMonthlyOutflowCommand;

const deserializer: DeleteMonthlyOutflowDeserializer = (params: any) => {
  try {
    Koi.validate(params.templateId).uuid();
    Koi.validate(params.outflowId).uuid();
  } catch (e: any) {
    throw new SerializationError("deleteMonthlyOutflow", e.message);
  }

  return {
    templateId: params.templateId,
    outflowId: params.outflowId,
  };
};

export default deserializer;
