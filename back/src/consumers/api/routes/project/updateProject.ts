import { Router } from "express";
import UpdateProject from "../../../../core/usecases/project/UpdateProject.js";
import { ProjectDtoBuilder } from "../../dtos/projectDto.js";
import { requestValidator } from "../../middleware/request-validator.js";
import { z } from "zod";
import { updateProjectSchema, uuidSchema } from "../../schemas.js";

type Dependencies = {
  usecase: UpdateProject;
  dto: ProjectDtoBuilder;
};

export default function route(router: Router, { usecase, dto }: Dependencies) {
  return router.patch(
    "/projects/:projectId",
    requestValidator({
      params: z.object({
        projectId: uuidSchema("L'id du projet n'est pas valide"),
      }),
      body: updateProjectSchema,
    }),
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const project = await usecase.execute({
          id: params.projectId,
          name: body.name,
          target: body.target,
        });
        const data = dto(project);
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}
