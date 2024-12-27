import UnarchiveMonthCommand from "../../../../core/commands/UnarchiveMonthCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type UnarchiveMonthDeserializer = (params: any) => UnarchiveMonthCommand;

const deserializer: UnarchiveMonthDeserializer = (params: any) => {
  try {
    Koi.validate(params.monthId).uuid();
  } catch (e: any) {
    throw new SerializationError("unarchiveMonth", e.message);
  }

  return {
    monthId: params.monthId,
  };
};

export default deserializer;
