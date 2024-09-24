import {Router} from "express";
import DeleteExpense from "../../../core/usecases/DeleteExpense.js";
import DeleteExpenseCommand from "../commands/DeleteExpenseCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";

type DeleteExpenseDeps = {
    deleteExpenseUsecase: DeleteExpense,
    monthDto: MonthDtoBuilder,
}

function deleteExpense(router: Router, {deleteExpenseUsecase, monthDto}: DeleteExpenseDeps) {
    return router.delete('/months/:monthId/weekly/:weeklyId/expenses/:expenseId', async (req, res, next) => {
        try {
            const {params} = req;
            const command = DeleteExpenseCommand.toCommand(params);
            const month = await deleteExpenseUsecase.execute(command);
            const dto = monthDto(month);
            res.status(200).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {deleteExpense};
