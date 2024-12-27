import { Router } from "express";
import RemoveProject from "../../../core/usecases/RemoveProject.js";
import { requestValidator } from "../middleware/request-validator.js";
import { z } from "zod";
import { uuidSchema } from "../schemas.js";

type Dependencies = {
  usecase: RemoveProject;
};

export default function route(router: Router, { usecase }: Dependencies) {
  return router.delete(
    "/projects/:projectId",
    requestValidator({
      params: z.object({
        projectId: uuidSchema("L'id du projet n'est pas valide"),
      }),
    }),
    async (req, res, next) => {
      try {
        const { params } = req;
        await usecase.execute({
          id: params.projectId,
        });
        res.status(200).send({ success: true });
      } catch (e) {
        next(e);
      }
    }
  );
}
