import { TransferBalanceIntoMonthCommand } from "../../../core/usecases/TransferBalanceIntoMonth.js";
import Koi from "../validators/Koi.js";
import SerializationError from "../errors/DeserializationError.js";

export type TransferBalanceIntoMonthDeserializer = (
  params: any,
  body: any
) => TransferBalanceIntoMonthCommand;

const deserializer: TransferBalanceIntoMonthDeserializer = (
  body: any,
  params: any
) => {
  try {
    Koi.validate(body.amount).number();
    Koi.validate(params.monthId).uuid();
    Koi.validate(params.fromType).oneOf<string>("weekly-budget", "account");
    Koi.validate(params.fromId).uuid();
    Koi.validate(params.toType).oneOf<string>("weekly-budget", "account");
    Koi.validate(params.toId).uuid();
  } catch (e: any) {
    throw new SerializationError("transferBalanceIntoMonth", e.message);
  }

  let command = {
    monthId: params.monthId,
    amount: body.amount,
  };

  if (params.fromType === "weekly-budget") {
    command["fromWeeklyBudgetId"] = params.fromId;
  } else if (params.fromType === "account") {
    command["fromAccountId"] = params.fromId;
  }
  if (params.toType === "weekly-budget") {
    command["toWeeklyBudgetId"] = params.toId;
  } else if (params.toType === "account") {
    command["toAccountId"] = params.toId;
  }

  return command;
};

export default deserializer;
