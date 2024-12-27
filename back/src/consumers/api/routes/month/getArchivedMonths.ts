import { Router, Response, Request } from "express";
import { MonthDtoBuilder } from "../../dtos/monthDto.js";
import GetArchivedMonths from "../../../../core/usecases/month/GetArchivedMonths.js";

type GetArchivedMonthsDeps = {
  getArchivedMonthsUsecase: GetArchivedMonths;
  monthDto: MonthDtoBuilder;
};

function getArchivedMonths(
  router: Router,
  { getArchivedMonthsUsecase, monthDto }: GetArchivedMonthsDeps
) {
  return router.get(
    "/months/archived",
    async (req: Request, res: Response, next: any) => {
      try {
        const months = await getArchivedMonthsUsecase.execute();
        const dtos = months.map((month) => monthDto(month));
        res.status(200).send({ success: true, data: dtos });
      } catch (e) {
        next(e);
      }
    }
  );
}

export { getArchivedMonths };
