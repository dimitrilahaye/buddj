import { Router } from "express";
import AddMonthlyBudget from "../../../../core/usecases/monthly-template/AddMonthlyBudget.js";
import { AddMonthlyBudgetDeserializer } from "../../deserializers/monthly-template/addMonthlyBudget.js";

type AddMonthlyBudgetDeps = {
  usecase: AddMonthlyBudget;
  deserializer: AddMonthlyBudgetDeserializer;
};

function addMonthlyBudget(
  router: Router,
  { usecase, deserializer }: AddMonthlyBudgetDeps
) {
  return router.post(
    "/monthly-templates/:templateId/monthly-budgets",
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

export { addMonthlyBudget };
