import { RemoveYearlyOutflowCommand } from "../../../../core/usecases/yearly-saving/RemoveYearlyOutflow.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type RemoveYearlyOutflowDeserializer = (
  params: any
) => RemoveYearlyOutflowCommand;

const deserializer: RemoveYearlyOutflowDeserializer = (params: any) => {
  try {
    Koi.validate(params.id).uuid();
  } catch (e: any) {
    throw new SerializationError("removeYearlyOutflow", e.message);
  }

  return {
    id: params.id,
  };
};

export default deserializer;
