import { Router } from "express";
import GetYearlyOutflows from "../../../core/usecases/GetYearlyOutflows.js";
import { YearlyOutflowsDtoBuilder } from "../dtos/yearlyOutflowsDto.js";

type GetYearlyOutflowsDeps = {
  getYearlyOutflows: GetYearlyOutflows;
  yearlyOutflowsDto: YearlyOutflowsDtoBuilder;
};

function getYearlyOutflows(
  router: Router,
  { getYearlyOutflows, yearlyOutflowsDto }: GetYearlyOutflowsDeps
) {
  return router.get("/yearly-outflows", async (req, res, next) => {
    try {
      const outflows = await getYearlyOutflows.execute();
      const dto = yearlyOutflowsDto(outflows);
      res.status(200).send({ success: true, data: dto });
    } catch (e) {
      next(e);
    }
  });
}

export { getYearlyOutflows };
