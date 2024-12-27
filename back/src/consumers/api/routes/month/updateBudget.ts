import { Router } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import UpdateBudget from "../../../../core/usecases/month/UpdateBudget.js";
import { UpdateBudgetDeserializer } from "../../deserializers/month/updateBudget.js";

type UpdateBudgetDeps = {
  usecase: UpdateBudget;
  deserializer: UpdateBudgetDeserializer;
  dto: MonthDtoBuilder;
};

function updateBudget(
  router: Router,
  { usecase, dto, deserializer }: UpdateBudgetDeps
) {
  return router.patch(
    "/months/:monthId/budgets/:budgetId",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const month = await usecase.execute(command);
        const data = dto(month);
        res.status(201).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { updateBudget };
