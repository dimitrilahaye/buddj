import { afterEach } from "mocha";
import { clearDB } from "../../test-helpers.js";
import expect from "../../../../test-helpers.js";
import MonthlyBudgetTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyBudgetTemplateRepository.js";
import {
  insertDefaultMonthlyTemplate,
  insertMonthlyBudgetTemplate,
} from "../../../../utils/persistence/seeds/MonthlyTemplateSeeds.js";

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
});
