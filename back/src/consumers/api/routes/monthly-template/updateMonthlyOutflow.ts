import { Router } from "express";
import UpdateMonthlyOutflow from "../../../../core/usecases/monthly-template/UpdateMonthlyOutflow.js";
import { UpdateMonthlyOutflowDeserializer } from "../../deserializers/monthly-template/updateMonthlyOutflow.js";

type UpdateMonthlyOutflowDeps = {
  usecase: UpdateMonthlyOutflow;
  deserializer: UpdateMonthlyOutflowDeserializer;
};

function updateMonthlyOutflow(
  router: Router,
  { usecase, deserializer }: UpdateMonthlyOutflowDeps
) {
  return router.patch(
    "/monthly-templates/:templateId/monthly-outflows/:outflowId",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const template = await usecase.execute(command);
        res.status(200).send({ success: true, data: template });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { updateMonthlyOutflow };
