import { Router } from "express";
import monthDto from "../../dtos/monthDto.js";
import GetUnarchivedMonths from "../../../../core/usecases/month/GetUnarchivedMonths.js";

type GetUnarchivedMonthsDeps = {
  getUnarchivedMonthsUsecase: GetUnarchivedMonths;
};

function getUnarchivedMonths(
  router: Router,
  { getUnarchivedMonthsUsecase }: GetUnarchivedMonthsDeps
) {
  return router.get("/months/unarchived", async (req, res, next) => {
    try {
      const months = await getUnarchivedMonthsUsecase.execute();
      const dtos = months.map((month) => monthDto(month));
      res.status(200).send({
        success: true,
        data: dtos,
      });
    } catch (e) {
      next(e);
    }
  });
}

export { getUnarchivedMonths };
