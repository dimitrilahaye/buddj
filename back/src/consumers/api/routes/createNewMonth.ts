import {Router} from "express";
import CreateNewMonth from "../../../core/usecases/CreateNewMonth.js";
import MonthCreationCommand from "../commands/MonthCreationCommand.js";
import monthDto from "../dtos/monthDto.js";

type CreateNewMonthDeps = {
    createNewMonthUsecase: CreateNewMonth,
}

function createNewMonth(router: Router, {createNewMonthUsecase}: CreateNewMonthDeps) {
    return router.post('/months', async (req, res, next) => {
        try {
            const command = MonthCreationCommand.toCommand(req.body);
            const month = await createNewMonthUsecase.execute(command);
            const dto = monthDto(month);
            res.status(201).send({
                success: true,
                data: dto,
            });
        } catch (e) {
            next(e);
        }
    });
}

export {createNewMonth};
