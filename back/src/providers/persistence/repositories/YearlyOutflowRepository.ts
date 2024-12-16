import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../core/models/yearly-outflows/YearlyOutflows.js";
import YearlyOutflowRepository from "../../../core/ports/repositories/YearlyOutflowRepository.js";
import { YearlyOutflowDao } from "../entities/YearlyOutflow.js";

export default class TypeOrmYearlyOutflowRepository
  implements YearlyOutflowRepository
{
  async getAll(): Promise<YearlyOutflows> {
    const savings = await YearlyOutflowDao.find();
    const savingToDomain = savings.map((o) => o.toDomain());
    const outflows = savingToDomain.filter((s) => s.type === "outflow");
    const budgets = savingToDomain.filter((s) => s.type === "budget");

    return new YearlyOutflows(outflows, budgets);
  }

  async add(outflow: YearlyOutflow): Promise<YearlyOutflows> {
    const dao = YearlyOutflowDao.fromDomain(outflow);
    await dao.save();

    return this.getAll();
  }

  async remove(id: string): Promise<YearlyOutflows> {
    await YearlyOutflowDao.delete(id);

    return this.getAll();
  }
}
