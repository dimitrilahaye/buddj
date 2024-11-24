import YearlyOutflow from "../../models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../models/yearly-outflows/YearlyOutflows.js";

export default interface YearlyOutflowRepository {
  getAll(): Promise<YearlyOutflows>;
  add(outflow: YearlyOutflow): Promise<YearlyOutflows>;
  remove(id: string): Promise<YearlyOutflows>;
}
