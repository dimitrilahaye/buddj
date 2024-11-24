import YearlyOutflow from "../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../core/models/yearly-outflows/YearlyOutflows.js";
import YearlyOutflowRepository from "../../../core/ports/repositories/YearlyOutflowRepository.js";
import { YearlyOutflowDao } from "../entities/YearlyOutflow.js";

export default class TypeOrmYearlyOutflowRepository
  implements YearlyOutflowRepository
{
  async getAll(): Promise<YearlyOutflows> {
    const outflows = await YearlyOutflowDao.find();

    return new YearlyOutflows(outflows.map((o) => o.toDomain()));
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
