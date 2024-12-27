import { Router } from "express";
import AddWeeklyExpense from "../../../../core/usecases/month/AddWeeklyExpense.js";
import monthDto from "../../dtos/monthDto.js";
import { AddWeeklyExpenseDeserializer } from "../../deserializers/month/addWeeklyExpense.js";

type AddWeeklyExpenseDeps = {
  addWeeklyExpenseUsecase: AddWeeklyExpense;
  deserializer: AddWeeklyExpenseDeserializer;
};

function addWeeklyExpense(
  router: Router,
  { addWeeklyExpenseUsecase, deserializer }: AddWeeklyExpenseDeps
) {
  return router.post(
    "/months/:monthId/weeks/:weekId/expenses/",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const month = await addWeeklyExpenseUsecase.execute(command);
        const dto = monthDto(month);
        res.status(201).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { addWeeklyExpense };
