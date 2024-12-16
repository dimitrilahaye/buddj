import YearlyBudget from "../../models/yearly-outflows/YearlyBudget.js";
import YearlyOutflow from "../../models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../models/yearly-outflows/YearlyOutflows.js";

export default interface YearlyOutflowRepository {
  getAll(): Promise<YearlyOutflows>;
  add(saving: YearlyOutflow | YearlyBudget): Promise<YearlyOutflows>;
  remove(id: string): Promise<YearlyOutflows>;
}
