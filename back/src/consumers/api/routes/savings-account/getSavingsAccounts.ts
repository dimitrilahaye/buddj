import { Router } from "express";
import GetSavingsAccounts from "../../../../core/usecases/savings-account/GetSavingsAccounts.js";
import { SavingsAccountDtoBuilder } from "../../dtos/savingsAccountDto.js";

type GetSavingsAccountsDeps = {
  usecase: GetSavingsAccounts;
  dto: SavingsAccountDtoBuilder;
};

function getSavingsAccounts(
  router: Router,
  { usecase, dto }: GetSavingsAccountsDeps
) {
  return router.get("/savings-accounts", async (req, res, next) => {
    try {
      const accounts = await usecase.execute();
      res.status(200).send({ success: true, data: accounts.map(dto) });
    } catch (e) {
      next(e);
    }
  });
}

export { getSavingsAccounts };
