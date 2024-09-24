import {Router} from "express";
import AddOutflowCommand from "../commands/AddOutflowCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";
import AddOutflow from "../../../core/usecases/AddOutflow.js";

type AddWeeklyExpenseDeps = {
    addOutflowUsecase: AddOutflow,
    monthDto: MonthDtoBuilder,
}

function addOutflow(router: Router, {addOutflowUsecase, monthDto}: AddWeeklyExpenseDeps) {
    return router.post('/months/:monthId/outflows/', async (req, res, next) => {
        try {
            const {params, body} = req;
            const command = AddOutflowCommand.toCommand(params, body);
            const month = await addOutflowUsecase.execute(command);
            const dto = monthDto(month);
            res.status(201).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {addOutflow};
