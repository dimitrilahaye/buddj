import { Router } from "express";
import GetAllProjectsByCategory from "../../../../core/usecases/project/GetAllProjectsByCategory.js";
import { ProjectDtoBuilder } from "../../dtos/projectDto.js";
import { requestValidator } from "../../middleware/request-validator.js";
import { z } from "zod";
import { projectCategorySchema } from "../../schemas.js";

type Dependencies = {
  usecase: GetAllProjectsByCategory;
  dto: ProjectDtoBuilder;
};

export default function route(router: Router, { usecase, dto }: Dependencies) {
  return router.get(
    "/projects/category/:category",
    requestValidator({
      params: z.object({
        category: projectCategorySchema,
      }),
    }),
    async (req, res, next) => {
      try {
        const { params } = req;
        const projects = await usecase.execute({
          category: params.category as "refund" | "saving",
        });
        const data = projects.map((project) => dto(project));
        res.status(200).send({ success: true, data });
      } catch (e) {
        next(e);
      }
    }
  );
}
