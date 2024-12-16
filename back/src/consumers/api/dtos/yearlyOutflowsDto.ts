import YearlyBudget from "../../../core/models/yearly-outflows/YearlyBudget.js";
import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../core/models/yearly-outflows/YearlyOutflows.js";

export type YearlyOutflowsDTO = {
  [month: number]: {
    outflows: Array<YearlyOutflow>;
    budgets: Array<YearlyBudget>;
  };
};

export type YearlyOutflowsDtoBuilder = (
  yearlyOutflows: YearlyOutflows
) => YearlyOutflowsDTO;

function yearlyOutflowsDto(yearlyOutflows: YearlyOutflows): YearlyOutflowsDTO {
  const groupedByMonth: YearlyOutflowsDTO = {};
  for (let month = 1; month <= 12; month++) {
    groupedByMonth[month] = {
      outflows: [],
      budgets: [],
    };
  }

  yearlyOutflows.getAll().forEach((outflow) => {
    if (outflow.type === "budget") {
      groupedByMonth[outflow.month].budgets.push(outflow);
    } else if (outflow.type === "outflow") {
      groupedByMonth[outflow.month].outflows.push(outflow);
    }
  });

  return groupedByMonth;
}

export default yearlyOutflowsDto;
