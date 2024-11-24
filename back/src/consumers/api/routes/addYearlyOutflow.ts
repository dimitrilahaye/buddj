import { Router } from "express";
import AddYearlyOutflow from "../../../core/usecases/AddYearlyOutflow.js";
import { YearlyOutflowsDtoBuilder } from "../dtos/yearlyOutflowsDto.js";
import { AddYearlyOutflowDeserializer } from "../deserializers/addYearlyOutflow.js";

type AddYearlyOutflowDeps = {
  addYearlyOutflow: AddYearlyOutflow;
  deserializer: AddYearlyOutflowDeserializer;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
};

function addYearlyOutflow(
  router: Router,
  { addYearlyOutflow, yearlyOutflowsDto, deserializer }: AddYearlyOutflowDeps
) {
  return router.post("/yearly-outflows", async (req, res, next) => {
    try {
      const { body } = req;
      const command = deserializer(body);
      const outflows = await addYearlyOutflow.execute(command);
      const dto = yearlyOutflowsDto(outflows);
      res.status(201).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { addYearlyOutflow };
