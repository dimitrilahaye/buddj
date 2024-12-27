import { Router } from "express";
import DeleteOutflow from "../../../../core/usecases/month/DeleteOutflow.js";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import { DeleteOutflowDeserializer } from "../../deserializers/month/deleteOutflow.js";

type DeleteOutflowDeps = {
  deleteOutflowUsecase: DeleteOutflow;
  monthDto: MonthDtoBuilder;
  deserializer: DeleteOutflowDeserializer;
};

function deleteOutflow(
  router: Router,
  { deleteOutflowUsecase, monthDto, deserializer }: DeleteOutflowDeps
) {
  return router.delete(
    "/months/:monthId/outflows/:outflowId",
    async (req, res, next) => {
      try {
        const { params } = req;
        const command = deserializer(params);
        const month = await deleteOutflowUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { deleteOutflow };
