import {Router} from "express";
import GetMonthCreationTemplate from "../../../core/usecases/GetMonthCreationTemplate.js";

type GetMonthTemplateDeps = {
    getMonthCreationTemplateUsecase: GetMonthCreationTemplate
}

function getMonthTemplate(router: Router, {getMonthCreationTemplateUsecase}: GetMonthTemplateDeps) {
    return router.get('/months/template', async (req, res, next) => {
        try {
            const month = await getMonthCreationTemplateUsecase.execute();
            res.send({success: true, data: month});
        } catch (e) {
            next(e);
        }
    });
}

export {getMonthTemplate};
