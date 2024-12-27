import { Router } from "express";
import DeleteMonthlyBudget from "../../../../core/usecases/monthly-template/DeleteMonthlyBudget.js";
import { DeleteMonthlyBudgetDeserializer } from "../../deserializers/monthly-template/deleteMonthlyBudget.js";

type DeleteBudgetDeps = {
  usecase: DeleteMonthlyBudget;
  deserializer: DeleteMonthlyBudgetDeserializer;
};

function deleteMonthlyBudget(
  router: Router,
  { usecase, deserializer }: DeleteBudgetDeps
) {
  return router.delete(
    "/monthly-templates/:templateId/monthly-budgets/:budgetId",
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

export { deleteMonthlyBudget };
