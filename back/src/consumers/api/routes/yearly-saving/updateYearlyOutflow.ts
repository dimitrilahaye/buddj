import { Router } from "express";
import UpdateYearlyOutflow from "../../../../core/usecases/yearly-saving/UpdateYearlyOutflow.js";
import { YearlyOutflowsDtoBuilder } from "../../dtos/yearlyOutflowsDto.js";
import { UpdateYearlyOutflowDeserializer } from "../../deserializers/yearly-saving/updateYearlyOutflow.js";

type UpdateYearlyOutflowDeps = {
  updateYearlyOutflow: UpdateYearlyOutflow;
  deserializer: UpdateYearlyOutflowDeserializer;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
};

function updateYearlyOutflow(
  router: Router,
  {
    updateYearlyOutflow,
    yearlyOutflowsDto,
    deserializer,
  }: UpdateYearlyOutflowDeps
) {
  return router.patch("/yearly-outflows/:id", async (req, res, next) => {
    try {
      const { params, body } = req;
      const command = deserializer(params, body);
      const outflows = await updateYearlyOutflow.execute(command);
      const dto = yearlyOutflowsDto(outflows);
      res.status(200).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { updateYearlyOutflow };
