import {Router} from "express";
import ManageOutflowsChecking from "../../../core/usecases/ManageOutflowsChecking.js";
import ManageOutflowsCheckingCommand from "../commands/ManageOutflowsCheckingCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";

type ManageOutflowsCheckingDeps = {
    manageOutflowsCheckingUsecase: ManageOutflowsChecking
    monthDto: MonthDtoBuilder,
}

function manageOutflowsChecking(router: Router, {manageOutflowsCheckingUsecase, monthDto}: ManageOutflowsCheckingDeps) {
    return router.put('/months/:monthId/outflows/checking', async (req, res, next) => {
        try {
            const {params, body} = req;
            const command = ManageOutflowsCheckingCommand.toCommand(params, body);
            const month = await manageOutflowsCheckingUsecase.execute(command);
            const dto = monthDto(month);
            res.status(200).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {manageOutflowsChecking};
