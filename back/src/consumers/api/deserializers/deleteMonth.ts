import DeleteMonthCommand from "../../../core/commands/DeleteMonthCommand.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type DeleteMonthDeserializer = (params: any) => DeleteMonthCommand;

const deserializer: DeleteMonthDeserializer = (params: any) => {
  try {
    Koi.validate(params.monthId).uuid();
  } catch (e: any) {
    throw new SerializationError("deleteMonth", e.message);
  }

  return {
    monthId: params.monthId,
  };
};

export default deserializer;
