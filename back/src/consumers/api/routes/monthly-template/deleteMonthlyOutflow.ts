import { Router } from "express";
import DeleteMonthlyOutflow from "../../../../core/usecases/monthly-template/DeleteMonthlyOutflow.js";
import { DeleteMonthlyOutflowDeserializer } from "../../deserializers/monthly-template/deleteMonthlyOutflow.js";

type DeleteOutflowDeps = {
  usecase: DeleteMonthlyOutflow;
  deserializer: DeleteMonthlyOutflowDeserializer;
};

function deleteMonthlyOutflow(
  router: Router,
  { usecase, deserializer }: DeleteOutflowDeps
) {
  return router.delete(
    "/monthly-templates/:templateId/monthly-outflows/:outflowId",
    async (req, res, next) => {
      try {
        const { params } = req;
        const command = deserializer(params);
        const template = await usecase.execute(command);
        res.status(200).send({ success: true, data: template });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { deleteMonthlyOutflow };
