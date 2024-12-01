import expect, { Clock } from "../../../../test-helpers.js";
import MonthlyTemplateRepository from "../../../../../providers/persistence/repositories/MonthlyTemplateRepository.js";
import MonthlyTemplate from "../../../../../core/models/template/MonthlyTemplate.js";
import env from "../../../../../env-vars.js";
import sinon from "sinon";

describe("Integration | Providers | Persistence | Repositories | MonthlyTemplateRepository", function () {
  const monthDate = new Date("2024-01-01");
  let clock = new Clock();

  afterEach(() => {
    clock.restore();
  });

  it("should return the right data for a new month creation", async function () {
    // given
    clock.start(monthDate);
    sinon.stub(env, "template").value({
      weeklyBudgets: [
        { name: "Semaine 1" },
        { name: "Semaine 2" },
        { name: "Semaine 3" },
        { name: "Semaine 4" },
        { name: "Semaine 5" },
      ],
      outflows: [
        { label: "Loyer", amount: 699.41 },
        { label: "Bouygues", amount: 70.89 },
      ],
    });
    const repository = new MonthlyTemplateRepository();

    // when
    const newMonth = await repository.getDefaultMonthlyTemplate();

    // then
    expect(newMonth.name).to.equal("Template par défaut");
    expect(newMonth.isDefault).to.equal(true);
    expect(newMonth.startingBalance).to.equal(0);
    expect(newMonth.month).to.deep.equal(monthDate);
    expect(newMonth.budgets).to.have.length(5);
    expect(newMonth.budgets.every((budget) => budget.initialBalance === 200)).to
      .be.true;
    expect(newMonth.outflows).to.have.length(2);
    expect(newMonth).to.be.instanceOf(MonthlyTemplate);
  });
});
