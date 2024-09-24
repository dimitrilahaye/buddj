import {Router} from "express";
import DeleteMonthCommand from "../commands/DeleteMonthCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";
import DeleteMonth from "../../../core/usecases/DeleteMonth.js";

type DeleteMonthDeps = {
    deleteMonthUsecase: DeleteMonth,
    monthDto: MonthDtoBuilder,
}

function deleteMonth(router: Router, {deleteMonthUsecase, monthDto}: DeleteMonthDeps) {
    return router.delete('/months/:monthId', async (req, res, next) => {
        try {
            const {params} = req;
            const command = DeleteMonthCommand.toCommand(params);
            const months = await deleteMonthUsecase.execute(command);
            const dtos = months.map((month) => monthDto(month));
            res.status(200).send({success: true, data: dtos});
        } catch (e) {
            next(e);
        }
    });
}

export {deleteMonth};
