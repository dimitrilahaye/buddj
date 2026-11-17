import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import TypeOrmYearlyOutflowRepository from "../../../../../providers/persistence/repositories/YearlyOutflowRepository.js";
import { YearlyOutflowDao } from "../../../../../providers/persistence/entities/YearlyOutflow.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";

const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | YearlyOutflowRepository | update", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("YearlyOutflowRepository#update", () => {
    it("should update an outflow and a budget, keeping their month and type", async () => {
      // given
      const repository = new TypeOrmYearlyOutflowRepository();
      const outflow = new YearlyOutflow({
        id: idProvider.get(),
        label: "Assurance",
        amount: 600,
        month: 3,
      });
      const budget = new YearlyBudget({
        id: idProvider.get(),
        name: "Vacances",
        initialBalance: 1200,
        month: 7,
      });
      await repository.add(outflow);
      await repository.add(budget);

      // when
      await repository.update(
        new YearlyOutflow({ ...outflow, label: "Assurance auto", amount: 660 })
      );
      const list = await repository.update(
        new YearlyBudget({ ...budget, name: "Vacances été", initialBalance: 1500 })
      );

      // then
      const persistedOutflow = await YearlyOutflowDao.findOneByOrFail({
        id: outflow.id,
      });
      expect(persistedOutflow.toDomain()).to.deep.equal(
        new YearlyOutflow({ id: outflow.id, label: "Assurance auto", amount: 660, month: 3 })
      );
      const persistedBudget = await YearlyOutflowDao.findOneByOrFail({
        id: budget.id,
      });
      expect(persistedBudget.toDomain()).to.deep.equal(
        new YearlyBudget({ id: budget.id, name: "Vacances été", initialBalance: 1500, month: 7 })
      );
      expect(list.getAll()).to.have.length(2);
    });
  });
});
