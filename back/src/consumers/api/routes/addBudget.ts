import { Router } from "express";
import { MonthDtoBuilder } from "../dtos/monthDto.js";
import AddBudget from "../../../core/usecases/AddBudget.js";
import { AddBudgetDeserializer } from "../deserializers/addBudget.js";

type AddBudgetDeps = {
  usecase: AddBudget;
  deserializer: AddBudgetDeserializer;
  dto: MonthDtoBuilder;
};

function addBudget(
  router: Router,
  { usecase, dto, deserializer }: AddBudgetDeps
) {
  return router.post("/months/:monthId/budgets/", async (req, res, next) => {
    try {
      const { params, body } = req;
      const command = deserializer(params, body);
      const month = await usecase.execute(command);
      const data = dto(month);
      res.status(201).send({ success: true, data });
    } catch (e) {
      next(e);
    }
  });
}

export { addBudget };
