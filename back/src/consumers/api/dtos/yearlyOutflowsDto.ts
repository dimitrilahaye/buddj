import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../core/models/yearly-outflows/YearlyOutflows.js";

export type YearlyOutflowsDTO = {
  [month: number]: Array<YearlyOutflow>;
};

export type YearlyOutflowsDtoBuilder = (
  yearlyOutflows: YearlyOutflows
) => YearlyOutflowsDTO;

function yearlyOutflowsDto(yearlyOutflows: YearlyOutflows): YearlyOutflowsDTO {
  const groupedByMonth: YearlyOutflowsDTO = {};
  for (let month = 1; month <= 12; month++) {
    groupedByMonth[month] = [];
  }

  yearlyOutflows.getAll().forEach((outflow) => {
    groupedByMonth[outflow.month].push(outflow);
  });

  return groupedByMonth;
}

export default yearlyOutflowsDto;
