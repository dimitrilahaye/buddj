import ManageOutflowsCheckingCommand from "../../../../core/commands/ManageOutflowsCheckingCommand.js";
import Koi from "../../validators/Koi.js";
import SerializationError from "../../errors/DeserializationError.js";

export type ManageOutflowsCheckingDeserializer = (
  params: any,
  body: any
) => ManageOutflowsCheckingCommand;

const deserializer: ManageOutflowsCheckingDeserializer = (
  params: any,
  body: any
) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(body.currentBalance).number();
    Koi.validate(body.outflows).array();
    body.outflows.forEach((outflow: { id: string; isChecked: boolean }) => {
      Koi.validate(outflow.id).uuid();
      Koi.validate(outflow.isChecked).boolean();
    });
  } catch (e: any) {
    throw new SerializationError("manageOutflowsChecking", e.message);
  }

  return {
    monthId: params.monthId,
    currentBalance: body.currentBalance,
    outflows: body.outflows,
  };
};

export default deserializer;
