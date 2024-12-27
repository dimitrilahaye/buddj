import { Router } from "express";
import UpdateMonthlyTemplate from "../../../../core/usecases/monthly-template/UpdateMonthlyTemplate.js";
import { UpdateMonthlyTemplateDeserializer } from "../../deserializers/monthly-template/updateMonthlyTemplate.js";

type UpdateMonthlyTemplateDeps = {
  usecase: UpdateMonthlyTemplate;
  deserializer: UpdateMonthlyTemplateDeserializer;
};

function updateMonthlyTemplate(
  router: Router,
  { usecase, deserializer }: UpdateMonthlyTemplateDeps
) {
  return router.patch("/monthly-templates/:id", async (req, res, next) => {
    try {
      const { params, body } = req;
      const command = deserializer(params, body);
      const template = await usecase.execute(command);
      res.send({ success: true, data: template });
    } catch (e) {
      next(e);
    }
  });
}

export { updateMonthlyTemplate };
