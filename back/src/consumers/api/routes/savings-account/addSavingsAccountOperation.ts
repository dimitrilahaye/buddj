import { Router } from "express";
import AddSavingsAccountOperation from "../../../../core/usecases/savings-account/AddSavingsAccountOperation.js";
import { SavingsAccountDtoBuilder } from "../../dtos/savingsAccountDto.js";
import { AddSavingsAccountOperationDeserializer } from "../../deserializers/savings-account/savingsAccountOperation.js";

type AddSavingsAccountOperationDeps = {
  usecase: AddSavingsAccountOperation;
  dto: SavingsAccountDtoBuilder;
  deserializer: AddSavingsAccountOperationDeserializer;
};

function addSavingsAccountOperation(
  router: Router,
  { usecase, dto, deserializer }: AddSavingsAccountOperationDeps
) {
  return router.post(
    "/savings-accounts/:savingsAccountId/operations",
    async (req, res, next) => {
      try {
        const command = deserializer(req.params, req.body);
        const account = await usecase.execute(command);
        res.status(201).send({ success: true, data: dto(account) });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { addSavingsAccountOperation };
