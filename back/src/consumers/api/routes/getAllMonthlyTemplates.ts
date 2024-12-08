import { Router } from "express";
import GetAllMonthlyTemplates from "../../../core/usecases/GetAllMonthlyTemplates.js";

type GetAllMonthlyTemplatesDeps = {
  usecase: GetAllMonthlyTemplates;
};

function getAllMonthlyTemplates(
  router: Router,
  { usecase }: GetAllMonthlyTemplatesDeps
) {
  return router.get("/months/template", async (req, res, next) => {
    try {
      const templates = await usecase.execute();
      res.send({ success: true, data: templates });
    } catch (e) {
      next(e);
    }
  });
}

export { getAllMonthlyTemplates };
