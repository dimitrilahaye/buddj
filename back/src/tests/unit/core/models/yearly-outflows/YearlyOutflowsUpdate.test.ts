import expect from "../../../../test-helpers.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";
import {
  YearlySavingAmountMustBePositiveError,
  YearlySavingLabelCanNotBeEmptyError,
  YearlySavingsIdDoesNotExistError,
} from "../../../../../core/errors/YearlyOutflowsErrors.js";

describe("Unit | Core | Models | Yearly outflows | YearlyOutflows#update", () => {
  function list() {
    return new YearlyOutflows(
      [new YearlyOutflow({ id: "outflow-id", month: 3, label: "Assurance", amount: 600 })],
      [new YearlyBudget({ id: "budget-id", month: 7, name: "Vacances", initialBalance: 1200 })]
    );
  }

  it("should update an outflow, keeping its month", () => {
    const l = list();

    const updated = l.update("outflow-id", "Assurance auto", 660);

    expect(updated).to.deep.equal(
      new YearlyOutflow({ id: "outflow-id", month: 3, label: "Assurance auto", amount: 660 })
    );
    expect(l.getMonthlyProjectsAmount()).to.equal(Number(((660 + 1200) / 12).toFixed(2)));
  });

  it("should update a budget, keeping its month", () => {
    const l = list();

    const updated = l.update("budget-id", "Vacances été", 1500);

    expect(updated).to.deep.equal(
      new YearlyBudget({ id: "budget-id", month: 7, name: "Vacances été", initialBalance: 1500 })
    );
  });

  it("should throw if id does not exist", () => {
    expect(() => list().update("unknown", "X", 10)).to.throw(
      YearlySavingsIdDoesNotExistError
    );
  });

  it("should throw if label is empty", () => {
    expect(() => list().update("outflow-id", " ", 10)).to.throw(
      YearlySavingLabelCanNotBeEmptyError
    );
  });

  it("should throw if amount is not positive", () => {
    expect(() => list().update("outflow-id", "X", -1)).to.throw(
      YearlySavingAmountMustBePositiveError
    );
  });
});
