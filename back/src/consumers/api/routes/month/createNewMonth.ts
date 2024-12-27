import { Router } from "express";
import CreateNewMonth from "../../../../core/usecases/month/CreateNewMonth.js";
import monthDto from "../../dtos/monthDto.js";
import { MonthCreationDeserializer } from "../../deserializers/month/monthCreation.js";

type CreateNewMonthDeps = {
  createNewMonthUsecase: CreateNewMonth;
  deserializer: MonthCreationDeserializer;
};

function createNewMonth(
  router: Router,
  { createNewMonthUsecase, deserializer }: CreateNewMonthDeps
) {
  return router.post("/months", async (req, res, next) => {
    try {
      const command = deserializer(req.body);
      const month = await createNewMonthUsecase.execute(command);
      const dto = monthDto(month);
      res.status(201).send({
        success: true,
        data: dto,
      });
    } catch (e) {
      next(e);
    }
  });
}

export { createNewMonth };
