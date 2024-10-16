import { Router } from "express";
import ManageOutflowsChecking from "../../../core/usecases/ManageOutflowsChecking.js";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import { ManageOutflowsCheckingDeserializer } from "../deserializers/manageOutflowChecking.js";

type ManageOutflowsCheckingDeps = {
  manageOutflowsCheckingUsecase: ManageOutflowsChecking;
  monthDto: MonthDtoBuilder;
  deserializer: ManageOutflowsCheckingDeserializer;
};

function manageOutflowsChecking(
  router: Router,
  {
    manageOutflowsCheckingUsecase,
    monthDto,
    deserializer,
  }: ManageOutflowsCheckingDeps
) {
  return router.put(
    "/months/:monthId/outflows/checking",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const month = await manageOutflowsCheckingUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { manageOutflowsChecking };
