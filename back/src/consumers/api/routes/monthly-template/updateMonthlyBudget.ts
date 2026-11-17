import { Router } from "express";
import UpdateMonthlyBudget from "../../../../core/usecases/monthly-template/UpdateMonthlyBudget.js";
import { UpdateMonthlyBudgetDeserializer } from "../../deserializers/monthly-template/updateMonthlyBudget.js";

type UpdateMonthlyBudgetDeps = {
  usecase: UpdateMonthlyBudget;
  deserializer: UpdateMonthlyBudgetDeserializer;
};

function updateMonthlyBudget(
  router: Router,
  { usecase, deserializer }: UpdateMonthlyBudgetDeps
) {
  return router.patch(
    "/monthly-templates/:templateId/monthly-budgets/:budgetId",
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

export { updateMonthlyBudget };
