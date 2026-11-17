import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import IdProvider from "../../../../../providers/IdProvider.js";
import MonthRepository from "../../../../../providers/persistence/repositories/MonthRepository.js";
import { insertUnarchivedMonth } from "../../../../utils/persistence/seeds/MonthSeeds.js";
import AccountOutflowFactory from "../../../../../core/factories/AccountOutflowFactory.js";
import { OutflowDao } from "../../../../../providers/persistence/entities/Outflow.js";

const idProvider = new IdProvider();

describe("Integration | Providers | Persistence | Repositories | MonthRepository | outflow update", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("MonthRepository#updateOutflow", () => {
    it("should persist the new label and amount", async () => {
      // given
      const month = (await insertUnarchivedMonth()).toDomain();
      const repository = new MonthRepository();
      const outflow = new AccountOutflowFactory(idProvider).create({
        amount: 10,
        label: "EDF",
      });
      await repository.addOutflow(month, outflow);
      month.addOutflow(outflow);
      const updated = month.updateOutflow(outflow.id, "Engie", 12.5);

      // when
      await repository.updateOutflow(updated);

      // then
      const persisted = await OutflowDao.findOneByOrFail({ id: outflow.id });
      expect(persisted.label).to.equal("Engie");
      expect(Number(persisted.amount)).to.equal(12.5);
    });
  });
});
