import { Router } from "express";
import GetSpendingTracker from "../../../../core/usecases/spending-tracker/GetSpendingTracker.js";
import { SpendingTrackerDtoBuilder } from "../../dtos/spendingTrackerDto.js";
import { GetSpendingTrackerDeserializer } from "../../deserializers/spending-tracker/getSpendingTracker.js";

type GetSpendingTrackerDeps = {
  usecase: GetSpendingTracker;
  dto: SpendingTrackerDtoBuilder;
  deserializer: GetSpendingTrackerDeserializer;
};

function getSpendingTracker(
  router: Router,
  { usecase, dto, deserializer }: GetSpendingTrackerDeps
) {
  return router.get("/spending-tracker", async (req, res, next) => {
    try {
      const command = deserializer(req.query);
      const spendingTracker = await usecase.execute(command);
      res.status(200).send({ success: true, data: dto(spendingTracker) });
    } catch (e) {
      next(e);
    }
  });
}

export { getSpendingTracker };
