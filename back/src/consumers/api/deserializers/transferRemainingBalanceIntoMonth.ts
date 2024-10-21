import { TransferRemainingBalanceIntoMonthCommand } from "../../../core/usecases/TransferRemainingBalanceIntoMonth.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type TransferRemainingBalanceIntoMonthDeserializer = (
  params: any
) => TransferRemainingBalanceIntoMonthCommand;

const deserializer: TransferRemainingBalanceIntoMonthDeserializer = (
  params: any
) => {
  try {
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.fromType).oneOf<string>("weekly-budget", "account");
    Koi.validate(params.fromId).uuid();
    Koi.validate(params.toType).oneOf<string>("weekly-budget", "account");
    Koi.validate(params.toId).uuid();
  } catch (e: any) {
    throw new SerializationError(
      "transferRemainingBalanceIntoMonth",
      e.message
    );
  }

  let command = {
    monthId: params.monthId,
  };

  if (params.fromType === "weekly-budget") {
    command["fromWeeklyBudgetId"] = params.fromId;
  } else if (params.fromType === "account") {
    command["fromAccountId"] = params.fromId;
  }
  if (params.toType === "weekly-budget") {
    command["toWeeklyBudgetId"] = params.fromId;
  } else if (params.toType === "account") {
    command["toAccountId"] = params.fromId;
  }

  return command;
};

export default deserializer;
