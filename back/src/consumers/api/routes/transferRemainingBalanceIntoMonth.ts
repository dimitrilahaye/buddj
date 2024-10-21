import { Router } from "express";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import TransferRemainingBalanceIntoMonth from "../../../core/usecases/TransferRemainingBalanceIntoMonth.js";
import { TransferRemainingBalanceIntoMonthDeserializer } from "../deserializers/transferRemainingBalanceIntoMonth.js";

type TransferRemainingBalanceIntoMonthDeps = {
  transferRemainingBalanceIntoMonthUsecase: TransferRemainingBalanceIntoMonth;
  deserializer: TransferRemainingBalanceIntoMonthDeserializer;
  monthDto: MonthDtoBuilder;
};

function transferRemainingBalanceIntoMonth(
  router: Router,
  {
    transferRemainingBalanceIntoMonthUsecase,
    monthDto,
    deserializer,
  }: TransferRemainingBalanceIntoMonthDeps
) {
  return router.put(
    "/months/:monthId/transfer/from/:fromType/:fromId/to/:toType/:toId",
    async (req, res, next) => {
      try {
        const { params } = req;
        const command = deserializer(params);
        const month = await transferRemainingBalanceIntoMonthUsecase.execute(
          command
        );
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { transferRemainingBalanceIntoMonth };
