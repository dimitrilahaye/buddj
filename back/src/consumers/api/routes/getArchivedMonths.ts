import {Router} from "express";
import UpdateExpenseCommand from "../commands/UpdateExpenseCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";
import GetArchivedMonths from "../../../core/usecases/GetArchivedMonths";

type UpdateExpenseDeps = {
    getArchivedMonthsUsecase: GetArchivedMonths,
    monthDto: MonthDtoBuilder,
}

function getArchivedMonths(router: Router, {getArchivedMonthsUsecase, monthDto}: UpdateExpenseDeps) {
    return router.get('/months/archived', async (req, res, next) => {
        try {
            const months = await getArchivedMonthsUsecase.execute();
            const dtos = months.map((month) => monthDto(month));
            res.status(200).send({success: true, data: dtos});
        } catch (e) {
            next(e);
        }
    });
}

export {getArchivedMonths};
