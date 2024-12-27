import { Router } from "express";
import AddAmountProject from "../../../core/usecases/AddAmountProject.js";
import { ProjectDtoBuilder } from "../dtos/projectDto.js";
import { requestValidator } from "../middleware/request-validator.js";
import { z } from "zod";
import { addAmountProjectSchema, uuidSchema } from "../schemas.js";

type Dependencies = {
  usecase: AddAmountProject;
  dto: ProjectDtoBuilder;
};

export default function route(router: Router, { usecase, dto }: Dependencies) {
  return router.patch(
    "/projects/:projectId/add",
    requestValidator({
      params: z.object({
        projectId: uuidSchema("L'id du projet n'est pas valide"),
      }),
      body: addAmountProjectSchema,
    }),
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const project = await usecase.execute({
          id: params.projectId,
          amount: body.amount,
        });
        const data = dto(project);
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}
