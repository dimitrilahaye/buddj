import { Router } from "express";
import UpdateExpenseCommand from "../../commands/UpdateExpenseCommand.js";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import UpdateExpense from "../../../../core/usecases/month/UpdateExpense.js";

type UpdateExpenseDeps = {
  updateExpenseUsecase: UpdateExpense;
  monthDto: MonthDtoBuilder;
};

/**
 * @deprecated
 */
function updateExpense(
  router: Router,
  { updateExpenseUsecase, monthDto }: UpdateExpenseDeps
) {
  return router.put(
    "/months/:monthId/weekly/:weeklyId/expenses/:expenseId",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = UpdateExpenseCommand.toCommand(params, body);
        const month = await updateExpenseUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { updateExpense };
