import {Router} from "express";
import UnarchiveMonthCommand from "../commands/UnarchiveMonthCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";
import UnarchiveMonth from "../../../core/usecases/UnarchiveMonth.js";

type UnarchiveMonthDeps = {
    unarchiveMonthUsecase: UnarchiveMonth,
    monthDto: MonthDtoBuilder,
}

function unarchiveMonth(router: Router, {unarchiveMonthUsecase, monthDto}: UnarchiveMonthDeps) {
    return router.put('/months/:monthId/unarchive', async (req, res, next) => {
        try {
            const {params} = req;
            const command = UnarchiveMonthCommand.toCommand(params);
            const months = await unarchiveMonthUsecase.execute(command);
            const dtos = months.map((month) => monthDto(month));
            res.status(200).send({success: true, data: dtos});
        } catch (e) {
            next(e);
        }
    });
}

export {unarchiveMonth};
