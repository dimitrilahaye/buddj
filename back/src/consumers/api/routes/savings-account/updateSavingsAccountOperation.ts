import { Router } from "express";
import UpdateSavingsAccountOperation from "../../../../core/usecases/savings-account/UpdateSavingsAccountOperation.js";
import { SavingsAccountDtoBuilder } from "../../dtos/savingsAccountDto.js";
import { UpdateSavingsAccountOperationDeserializer } from "../../deserializers/savings-account/savingsAccountOperation.js";

type UpdateSavingsAccountOperationDeps = {
  usecase: UpdateSavingsAccountOperation;
  dto: SavingsAccountDtoBuilder;
  deserializer: UpdateSavingsAccountOperationDeserializer;
};

function updateSavingsAccountOperation(
  router: Router,
  { usecase, dto, deserializer }: UpdateSavingsAccountOperationDeps
) {
  return router.patch(
    "/savings-accounts/:savingsAccountId/operations/:operationId",
    async (req, res, next) => {
      try {
        const command = deserializer(req.params, req.body);
        const account = await usecase.execute(command);
        res.status(200).send({ success: true, data: dto(account) });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { updateSavingsAccountOperation };
