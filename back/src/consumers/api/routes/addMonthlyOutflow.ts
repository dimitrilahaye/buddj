import { Router } from "express";
import AddMonthlyOutflow from "../../../core/usecases/AddMonthlyOutflow.js";
import { AddMonthlyOutflowDeserializer } from "../deserializers/addMonthlyOutflow.js";

type AddMonthlyOutflowDeps = {
  usecase: AddMonthlyOutflow;
  deserializer: AddMonthlyOutflowDeserializer;
};

function addMonthlyOutflow(
  router: Router,
  { usecase, deserializer }: AddMonthlyOutflowDeps
) {
  return router.post(
    "/monthly-templates/:templateId/monthly-outflows",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const template = await usecase.execute(command);
        res.status(201).send({ success: true, data: template });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { addMonthlyOutflow };
