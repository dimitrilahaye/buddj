import { Router } from "express";
import GetDefaultMonthlyTemplate from "../../../core/usecases/GetDefaultMonthlyTemplate.js";

type GetDefaultMonthlyTemplateDeps = {
  usecase: GetDefaultMonthlyTemplate;
};

function getDefaultMonthlyTemplate(
  router: Router,
  { usecase }: GetDefaultMonthlyTemplateDeps
) {
  return router.get("/months/template/default", async (req, res, next) => {
    try {
      const month = await usecase.execute();
      res.send({ success: true, data: month });
    } catch (e) {
      next(e);
    }
  });
}

export { getDefaultMonthlyTemplate };
