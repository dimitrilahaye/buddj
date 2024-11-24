import { Router } from "express";
import RemoveYearlyOutflow from "../../../core/usecases/RemoveYearlyOutflow.js";
import { YearlyOutflowsDtoBuilder } from "../dtos/yearlyOutflowsDto.js";
import { RemoveYearlyOutflowDeserializer } from "../deserializers/removeYearlyOutflow.js";

type RemoveYearlyOutflowDeps = {
  removeYearlyOutflow: RemoveYearlyOutflow;
  deserializer: RemoveYearlyOutflowDeserializer;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
};

function removeYearlyOutflow(
  router: Router,
  {
    removeYearlyOutflow,
    yearlyOutflowsDto,
    deserializer,
  }: RemoveYearlyOutflowDeps
) {
  return router.delete("/yearly-outflows/:id", async (req, res, next) => {
    try {
      const { params } = req;
      const command = deserializer(params);
      const outflows = await removeYearlyOutflow.execute(command);
      const dto = yearlyOutflowsDto(outflows);
      res.status(200).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { removeYearlyOutflow };
