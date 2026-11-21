import { Router } from "express";
import DeleteSavingsAccountOperation from "../../../../core/usecases/savings-account/DeleteSavingsAccountOperation.js";
import { SavingsAccountDtoBuilder } from "../../dtos/savingsAccountDto.js";
import { DeleteSavingsAccountOperationDeserializer } from "../../deserializers/savings-account/savingsAccountOperation.js";

type DeleteSavingsAccountOperationDeps = {
  usecase: DeleteSavingsAccountOperation;
  dto: SavingsAccountDtoBuilder;
  deserializer: DeleteSavingsAccountOperationDeserializer;
};

function deleteSavingsAccountOperation(
  router: Router,
  { usecase, dto, deserializer }: DeleteSavingsAccountOperationDeps
) {
  return router.delete(
    "/savings-accounts/:savingsAccountId/operations/:operationId",
    async (req, res, next) => {
      try {
        const command = deserializer(req.params);
        const account = await usecase.execute(command);
        res.status(200).send({ success: true, data: dto(account) });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { deleteSavingsAccountOperation };
