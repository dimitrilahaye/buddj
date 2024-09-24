import {Router} from "express";
import ArchiveMonth from "../../../core/usecases/ArchiveMonth.js";
import ArchiveMonthCommand from "../commands/ArchiveMonthCommand.js";
import {MonthDtoBuilder} from "../dtos/monthDto.js";

type ArchiveMonthDeps = {
    archiveMonthUsecase: ArchiveMonth
    monthDto: MonthDtoBuilder,
}

function archiveMonth(router: Router, {archiveMonthUsecase, monthDto}: ArchiveMonthDeps) {
    return router.put('/months/:monthId/archive', async (req, res, next) => {
        try {
            const {params} = req;
            const command = ArchiveMonthCommand.toCommand(params);
            const month = await archiveMonthUsecase.execute(command);
            const dto = monthDto(month);
            res.status(200).send({success: true, data: dto});
        } catch (e) {
            next(e);
        }
    });
}

export {archiveMonth};
