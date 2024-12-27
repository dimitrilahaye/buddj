import { Router } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import AddOutflow from "../../../../core/usecases/month/AddOutflow.js";
import { AddOutflowDeserializer } from "../../deserializers/month/addOutflow.js";

type AddOutflowDeps = {
  addOutflowUsecase: AddOutflow;
  deserializer: AddOutflowDeserializer;
  monthDto: MonthDtoBuilder;
};

function addOutflow(
  router: Router,
  { addOutflowUsecase, monthDto, deserializer }: AddOutflowDeps
) {
  return router.post("/months/:monthId/outflows/", async (req, res, next) => {
    try {
      const { params, body } = req;
      const command = deserializer(params, body);
      const month = await addOutflowUsecase.execute(command);
      const dto = monthDto(month);
      res.status(201).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { addOutflow };
