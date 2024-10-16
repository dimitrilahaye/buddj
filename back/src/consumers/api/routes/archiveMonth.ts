import { Router } from "express";
import ArchiveMonth from "../../../core/usecases/ArchiveMonth.js";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import { ArchiveMonthDeserializer } from "../deserializers/archiveMonth.js";

type ArchiveMonthDeps = {
  archiveMonthUsecase: ArchiveMonth;
  monthDto: MonthDtoBuilder;
  deserializer: ArchiveMonthDeserializer;
};

function archiveMonth(
  router: Router,
  { archiveMonthUsecase, monthDto, deserializer }: ArchiveMonthDeps
) {
  return router.put("/months/:monthId/archive", async (req, res, next) => {
    try {
      const { params } = req;
      const command = deserializer(params);
      const month = await archiveMonthUsecase.execute(command);
      const dto = monthDto(month);
      res.status(200).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { archiveMonth };
