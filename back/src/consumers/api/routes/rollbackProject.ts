import { Router } from "express";
import RollbackProject from "../../../core/usecases/RollbackProject.js";
import { ProjectDtoBuilder } from "../dtos/projectDto.js";
import { requestValidator } from "../middleware/request-validator.js";
import { z } from "zod";
import { uuidSchema } from "../schemas.js";

type Dependencies = {
  usecase: RollbackProject;
  dto: ProjectDtoBuilder;
};

export default function route(router: Router, { usecase, dto }: Dependencies) {
  return router.patch(
    "/projects/:projectId/rollback",
    requestValidator({
      params: z.object({
        projectId: uuidSchema("L'id du projet n'est pas valide"),
      }),
    }),
    async (req, res, next) => {
      try {
        const { params } = req;
        const project = await usecase.execute({
          id: params.projectId,
        });
        const data = dto(project);
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}
