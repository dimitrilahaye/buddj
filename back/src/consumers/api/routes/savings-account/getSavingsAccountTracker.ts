import { Router } from "express";
import GetSavingsAccountTracker from "../../../../core/usecases/savings-account/GetSavingsAccountTracker.js";
import { SavingsAccountTrackerDtoBuilder } from "../../dtos/savingsAccountDto.js";
import { GetSavingsAccountTrackerDeserializer } from "../../deserializers/savings-account/getSavingsAccountTracker.js";

type GetSavingsAccountTrackerDeps = {
  usecase: GetSavingsAccountTracker;
  dto: SavingsAccountTrackerDtoBuilder;
  deserializer: GetSavingsAccountTrackerDeserializer;
};

function getSavingsAccountTracker(
  router: Router,
  { usecase, dto, deserializer }: GetSavingsAccountTrackerDeps
) {
  return router.get(
    "/savings-accounts/:savingsAccountId/tracker",
    async (req, res, next) => {
      try {
        const command = deserializer(req.params, req.query);
        const tracker = await usecase.execute(command);
        res.status(200).send({ success: true, data: dto(tracker) });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { getSavingsAccountTracker };
