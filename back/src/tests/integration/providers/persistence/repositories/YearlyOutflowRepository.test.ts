import { afterEach, before } from "mocha";
import expect from "../../../../test-helpers.js";
import { clearDB } from "../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import TypeOrmYearlyOutflowRepository from "../../../../../providers/persistence/repositories/YearlyOutflowRepository.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import { YearlyOutflowDao } from "../../../../../providers/persistence/entities/YearlyOutflow.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";

const repository = new TypeOrmYearlyOutflowRepository();
const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | YearlyOutflowRepository", function () {
  before(async () => {
    await clearDB();
  });

  afterEach(async () => {
    await clearDB();
  });

  describe("#getAll", function () {
    describe("When there is not any persisted yearly outflow", function () {
      it("should return an empty list", async function () {
        // when
        const list = await repository.getAll();

        // then
        expect(list.getAll()).to.have.length(0);
      });
    });

    describe("When there are persisted yearly outflows and budgets", function () {
      it("should return the list of outflows", async function () {
        // given
        const outflow = new YearlyOutflow({
          id: idProvider.get(),
          label: "label",
          amount: 10,
          month: 1,
        });
        await YearlyOutflowDao.save(YearlyOutflowDao.fromDomain(outflow));

        const budget = new YearlyBudget({
          id: idProvider.get(),
          name: "label",
          initialBalance: 10,
          month: 1,
        });
        await YearlyOutflowDao.save(YearlyOutflowDao.fromDomain(budget));

        // when
        const list = await repository.getAll();

        // then
        expect(list.getAll()).to.have.length(2);
        expect(list.getAll()[0]).to.deep.equal(outflow);
        expect(list.getAll()[1]).to.deep.equal(budget);
      });
    });
  });
  describe("#add", function () {
    it("should persisted the saving", async function () {
      // given
      const outflow = new YearlyOutflow({
        id: idProvider.get(),
        label: "label",
        amount: 10,
        month: 1,
      });
      const budget = new YearlyBudget({
        id: idProvider.get(),
        name: "label",
        initialBalance: 10,
        month: 1,
      });

      // when
      await repository.add(budget);
      const list = await repository.add(outflow);

      // then
      expect(list.getAll()).to.have.length(2);
      expect(list.getAll()).to.deep.equal([outflow, budget]);
    });
  });

  describe("#remove", function () {
    it("should remove the outflow", async function () {
      // given
      const outflow = new YearlyOutflow({
        id: idProvider.get(),
        label: "label",
        amount: 10,
        month: 1,
      });
      await YearlyOutflowDao.save(YearlyOutflowDao.fromDomain(outflow));

      // when
      const list = await repository.remove(outflow.id);

      // then
      expect(list.getAll()).to.have.length(0);
    });
  });
});
