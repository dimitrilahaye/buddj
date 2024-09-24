import {Router} from "express";
import ManageExpensesChecking from "../../../core/usecases/ManageExpensesChecking.js";
import ManageExpensesCheckingCommand from "../commands/ManageExpensesCheckingCommand.js";
import monthDto from "../dtos/monthDto.js";

type ManageExpensesCheckingDeps = {
    manageExpensesCheckingUsecase: ManageExpensesChecking
}

function manageExpensesChecking(router: Router, {manageExpensesCheckingUsecase}: ManageExpensesCheckingDeps) {
    return router.put('/months/:monthId/expenses/checking', async (req, res, next) => {
        try {
            const {params, body} = req;
            const command = ManageExpensesCheckingCommand.toCommand(params, body);
            const month = await manageExpensesCheckingUsecase.execute(command);
            const dto = monthDto(month);
            res.status(200).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {manageExpensesChecking};
