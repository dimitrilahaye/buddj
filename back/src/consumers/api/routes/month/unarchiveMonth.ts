import { Router } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import UnarchiveMonth from "../../../../core/usecases/month/UnarchiveMonth.js";
import { UnarchiveMonthDeserializer } from "../../deserializers/month/unarchiveMonth.js";

type UnarchiveMonthDeps = {
  unarchiveMonthUsecase: UnarchiveMonth;
  monthDto: MonthDtoBuilder;
  deserializer: UnarchiveMonthDeserializer;
};

function unarchiveMonth(
  router: Router,
  { unarchiveMonthUsecase, monthDto, deserializer }: UnarchiveMonthDeps
) {
  return router.put("/months/:monthId/unarchive", async (req, res, next) => {
    try {
      const { params } = req;
      const command = deserializer(params);
      const months = await unarchiveMonthUsecase.execute(command);
      const dtos = months.map((month) => monthDto(month));
      res.status(200).send({ success: true, data: dtos });
    } catch (e) {
      next(e);
    }
  });
}

export { unarchiveMonth };
