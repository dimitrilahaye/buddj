import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import MonthlyBudgetTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyBudgetTemplateRepository.js";
import {
  insertDefaultMonthlyTemplate,
  insertMonthlyBudgetTemplate,
} from "../../../../utils/persistence/seeds/MonthlyTemplateSeeds.js";
import { MonthlyBudgetTemplateDao } from "../../../../../providers/persistence/entities/MonthlyBudgetTemplate.js";
import MonthlyBudgetTemplate from "../../../../../core/models/monthly-template/MonthlyBudgetTemplate.js";

describe("Integration | Providers | Persistence | Repositories | MonthlyBudgetTemplateRepository", function () {
  afterEach(async () => {
    await clearDB();
  });

  describe("#getAllByTemplateId", () => {
    describe("when there are no any budgets for the given template", () => {
      it("should return an empty list", async () => {
        // given
        const template = await insertDefaultMonthlyTemplate();
        const repository = new MonthlyBudgetTemplateRepository();

        // when
        const foundBudgets = await repository.getAllByTemplateId(template.id);

        // then
        expect(foundBudgets).to.have.length(0);
      });
    });

    describe("when there are budgets for the given template", () => {
      it("should return the right instance of the model", async () => {
        // given
        const template = await insertDefaultMonthlyTemplate();
        const budget = await insertMonthlyBudgetTemplate(template.id);
        const repository = new MonthlyBudgetTemplateRepository();

        // when
        const [foundBudget] = await repository.getAllByTemplateId(template.id);

        // then
        expect(foundBudget).to.deep.equal(budget.toDomain());
      });
    });
  });

  describe("#deleteById", () => {
    it("should delete the budget", async () => {
      // given
      const template = await insertDefaultMonthlyTemplate();
      const budget = await insertMonthlyBudgetTemplate(template.id);
      const repository = new MonthlyBudgetTemplateRepository();

      // when
      await repository.deleteById(budget.id);

      // then
      const foundBudgets = await MonthlyBudgetTemplateDao.findBy({
        id: budget.id,
      });
      expect(foundBudgets).to.have.length(0);
    });
  });

  describe("#save", () => {
    it("should create the budget", async () => {
      // given
      const newBudget = new MonthlyBudgetTemplate({
        id: "5f9f1228-d649-4228-b599-b709278dc4fe",
        name: "Semaine 1",
        initialBalance: 200,
      });
      const template = await insertDefaultMonthlyTemplate();
      const repository = new MonthlyBudgetTemplateRepository();

      // when
      await repository.save(template.id, newBudget);

      // then
      const foundBudgets = await MonthlyBudgetTemplateDao.findBy({
        id: newBudget.id,
      });
      expect(foundBudgets).to.have.length(1);
    });
  });
});
