import { Router } from "express";
import ManageExpensesChecking from "../../../core/usecases/ManageExpensesChecking.js";
import monthDto from "../dtos/monthDto.js";
import { ManageExpensesCheckingDeserializer } from "../deserializers/manageExpenseChecking.js";

type ManageExpensesCheckingDeps = {
  manageExpensesCheckingUsecase: ManageExpensesChecking;
  deserializer: ManageExpensesCheckingDeserializer;
};

function manageExpensesChecking(
  router: Router,
  { manageExpensesCheckingUsecase, deserializer }: ManageExpensesCheckingDeps
) {
  return router.put(
    "/months/:monthId/expenses/checking",
    async (req, res, next) => {
      try {
        const { params, body } = req;
        const command = deserializer(params, body);
        const month = await manageExpensesCheckingUsecase.execute(command);
        const dto = monthDto(month);
        res.status(200).send({ success: true, data: dto });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { manageExpensesChecking };
