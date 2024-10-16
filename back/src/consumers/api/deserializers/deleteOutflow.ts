import DeleteOutflowCommand from "../../../core/commands/DeleteOutflowCommand.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type DeleteOutflowDeserializer = (params: any) => DeleteOutflowCommand;

const deserializer: DeleteOutflowDeserializer = (params: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.outflowId).uuid();
  } catch (e: any) {
    throw new SerializationError("deleteOutflow", e.message);
  }

  return {
    monthId: params.monthId,
    outflowId: params.outflowId,
  };
};

export default deserializer;
