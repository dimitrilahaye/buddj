import AddOutflowCommand from "../../../../core/commands/AddOutflowCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type AddOutflowDeserializer = (
  params: any,
  body: any
) => AddOutflowCommand;

const deserializer: AddOutflowDeserializer = (params: any, body: any) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(body.label).string();
    Koi.validate(body.amount).number();
  } catch (e: any) {
    throw new SerializationError("addOutflow", e.message);
  }

  return {
    monthId: params.monthId,
    label: body.label,
    amount: body.amount,
  };
};

export default deserializer;
