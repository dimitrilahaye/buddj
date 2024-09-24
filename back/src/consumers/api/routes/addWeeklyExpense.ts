import {Router} from "express";
import AddWeeklyExpense from "../../../core/usecases/AddWeeklyExpense.js";
import AddWeeklyExpenseCommand from "../commands/AddWeeklyExpenseCommand.js";
import monthDto from "../dtos/monthDto.js";

type AddWeeklyExpenseDeps = {
    addWeeklyExpenseUsecase: AddWeeklyExpense
}

function addWeeklyExpense(router: Router, {addWeeklyExpenseUsecase}: AddWeeklyExpenseDeps) {
    return router.post('/months/:monthId/weeks/:weekId/expenses/', async (req, res, next) => {
        try {
            const {params, body} = req;
            const command = AddWeeklyExpenseCommand.toCommand(params, body);
            const month = await addWeeklyExpenseUsecase.execute(command);
            const dto = monthDto(month);
            res.status(201).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {addWeeklyExpense};
