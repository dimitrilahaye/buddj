import { Router } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import RemoveBudget from "../../../../core/usecases/month/RemoveBudget.js";
import { requestValidator } from "../../middleware/request-validator.js";
import { uuidSchema } from "../../schemas.js";
import { z } from "zod";

type AddBudgetDeps = {
  usecase: RemoveBudget;
  dto: MonthDtoBuilder;
};

function removeBudget(router: Router, { usecase, dto }: AddBudgetDeps) {
  return router.delete(
    "/months/:monthId/budgets/:budgetId",
    requestValidator({
      params: z.object({
        monthId: uuidSchema("L'id du mois n'est pas valide"),
        budgetId: uuidSchema("L'id du budget n'est pas valide"),
      }),
    }),
    async (req, res, next) => {
      try {
        const { params } = req;
        const month = await usecase.execute({
          monthId: params.monthId,
          budgetId: params.budgetId,
        });
        const data = dto(month);
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { removeBudget };
