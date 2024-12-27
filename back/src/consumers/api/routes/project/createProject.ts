import { Router } from "express";
import CreateProject from "../../../../core/usecases/project/CreateProject.js";
import { ProjectDtoBuilder } from "../../dtos/projectDto.js";
import { requestValidator } from "../../middleware/request-validator.js";
import { addProjectSchema } from "../../schemas.js";

type Dependencies = {
  usecase: CreateProject;
  dto: ProjectDtoBuilder;
};

export default function route(router: Router, { usecase, dto }: Dependencies) {
  return router.post(
    "/projects",
    requestValidator({
      body: addProjectSchema,
    }),
    async (req, res, next) => {
      try {
        const { body } = req;
        const project = await usecase.execute({
          category: body.category as "refund" | "saving",
          name: body.name,
          target: body.target,
        });
        const data = dto(project);
        res.status(201).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}
