import { Router } from "express";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import TransferBalanceIntoMonth from "../../../core/usecases/TransferBalanceIntoMonth.js";
import { TransferBalanceIntoMonthDeserializer } from "../deserializers/transferBalanceIntoMonth.js";

type TransferBalanceIntoMonthDeps = {
  transferBalanceIntoMonthUsecase: TransferBalanceIntoMonth;
  deserializer: TransferBalanceIntoMonthDeserializer;
  monthDto: MonthDtoBuilder;
};

function transferBalanceIntoMonth(
  router: Router,
  {
    transferBalanceIntoMonthUsecase,
    monthDto,
    deserializer,
  }: TransferBalanceIntoMonthDeps
) {
  return router.put(
    "/months/:monthId/transfer/from/:fromType/:fromId/to/:toType/:toId",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(body, params);
        const month = await transferBalanceIntoMonthUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { transferBalanceIntoMonth };
