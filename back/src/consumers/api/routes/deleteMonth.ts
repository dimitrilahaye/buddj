import { Router } from "express";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import DeleteMonth from "../../../core/usecases/DeleteMonth.js";
import { DeleteMonthDeserializer } from "../deserializers/deleteMonth.js";

type DeleteMonthDeps = {
  deleteMonthUsecase: DeleteMonth;
  monthDto: MonthDtoBuilder;
  deserializer: DeleteMonthDeserializer;
};

function deleteMonth(
  router: Router,
  { deleteMonthUsecase, monthDto, deserializer }: DeleteMonthDeps
) {
  return router.delete("/months/:monthId", async (req, res, next) => {
    try {
      const { params } = req;
      const command = deserializer(params);
      const months = await deleteMonthUsecase.execute(command);
      const dtos = months.map((month) => monthDto(month));
      res.status(200).send({ success: true, data: dtos });
    } catch (e) {
      next(e);
    }
  });
}

export { deleteMonth };
