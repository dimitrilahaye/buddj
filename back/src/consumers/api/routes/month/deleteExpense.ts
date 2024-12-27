import { Router } from "express";
import DeleteExpense from "../../../../core/usecases/month/DeleteExpense.js";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import { DeleteExpenseDeserializer } from "../../deserializers/month/deleteExpense.js";

type DeleteExpenseDeps = {
  deleteExpenseUsecase: DeleteExpense;
  monthDto: MonthDtoBuilder;
  deserializer: DeleteExpenseDeserializer;
};

function deleteExpense(
  router: Router,
  { deleteExpenseUsecase, monthDto, deserializer }: DeleteExpenseDeps
) {
  return router.delete(
    "/months/:monthId/weekly/:weeklyId/expenses/:expenseId",
    async (req, res, next) => {
      try {
        const { params } = req;
        const command = deserializer(params);
        const month = await deleteExpenseUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { deleteExpense };
