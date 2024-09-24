import {Router} from "express";
import DeleteOutflow from "../../../core/usecases/DeleteOutflow.js";
import DeleteOutflowCommand from "../commands/DeleteOutflowCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";

type DeleteOutflowDeps = {
    deleteOutflowUsecase: DeleteOutflow,
    monthDto: MonthDtoBuilder,
}

function deleteOutflow(router: Router, {deleteOutflowUsecase, monthDto}: DeleteOutflowDeps) {
    return router.delete('/months/:monthId/outflows/:outflowId', async (req, res, next) => {
        try {
            const {params} = req;
            const command = DeleteOutflowCommand.toCommand(params);
            const month = await deleteOutflowUsecase.execute(command);
            const dto = monthDto(month);
            res.status(200).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {deleteOutflow};
