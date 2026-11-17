import { Router } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import UpdateOutflow from "../../../../core/usecases/month/UpdateOutflow.js";
import { UpdateOutflowDeserializer } from "../../deserializers/month/updateOutflow.js";

type UpdateOutflowDeps = {
  usecase: UpdateOutflow;
  deserializer: UpdateOutflowDeserializer;
  dto: MonthDtoBuilder;
};

function updateOutflow(
  router: Router,
  { usecase, dto, deserializer }: UpdateOutflowDeps
) {
  return router.patch(
    "/months/:monthId/outflows/:outflowId",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const month = await usecase.execute(command);
        const data = dto(month);
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { updateOutflow };
