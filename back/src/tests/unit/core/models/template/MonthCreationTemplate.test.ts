import expect, { Clock } from "../../../../test-helpers.js";
import MonthCreationTemplate from "../../../../../core/models/template/MonthCreationTemplate.js";
import WeeklyBudgetTemplate from "../../../../../core/models/template/WeeklyBudgetTemplate.js";
import OutflowTemplate from "../../../../../core/models/template/OutflowTemplate.js";
import {
  MonthCreationOutflowsError,
  MonthCreationTemplateWeeklyBudgetError,
} from "../../../../../core/errors/MonthCreationTemplateErrors.js";

describe("Unit | Core | Models | Template | MonthCreationTemplate", function () {
  const monthDate = new Date("2024-01-01");

  describe("#constructor", function () {
    let clock = new Clock();

    afterEach(() => {
      clock.restore();
    });

    it("should give an outflow template with right data", function () {
      // given
      clock.start(monthDate);

      const props = {
        weeklyBudgets: [
          new WeeklyBudgetTemplate({ name: "Semaine 1" }),
          new WeeklyBudgetTemplate({ name: "Semaine 2" }),
          new WeeklyBudgetTemplate({ name: "Semaine 3" }),
          new WeeklyBudgetTemplate({ name: "Semaine 4" }),
          new WeeklyBudgetTemplate({ name: "Semaine 5" }),
        ],
        outflows: [new OutflowTemplate({ label: "outflow", amount: 10 })],
      };

      // when
      const month = new MonthCreationTemplate(props);

      // then
      expect(month).to.deep.equal({
        ...props,
        month: monthDate,
        startingBalance: 0,
      });
    });
  });
  describe("if there is not 5 weekly budgets", function () {
    let clock = new Clock();

    afterEach(() => {
      clock.restore();
    });

    it("should throw MonthCreationWeeklyBudgetError if there is less than 5 weekly budgets", function () {
      // given
      clock.start(monthDate);

      const props = {
        weeklyBudgets: [
          new WeeklyBudgetTemplate({ name: "Semaine 1" }),
          new WeeklyBudgetTemplate({ name: "Semaine 2" }),
          new WeeklyBudgetTemplate({ name: "Semaine 3" }),
          new WeeklyBudgetTemplate({ name: "Semaine 4" }),
        ],
        outflows: [new OutflowTemplate({ label: "outflow", amount: 10 })],
      };

      // when / then
      expect(() => new MonthCreationTemplate(props)).to.throw(
        MonthCreationTemplateWeeklyBudgetError
      );
    });
    it("should throw MonthCreationWeeklyBudgetError if there is more than 5 weekly budgets", function () {
      // given
      clock.start(monthDate);

      const props = {
        weeklyBudgets: [
          new WeeklyBudgetTemplate({ name: "Semaine 1" }),
          new WeeklyBudgetTemplate({ name: "Semaine 2" }),
          new WeeklyBudgetTemplate({ name: "Semaine 3" }),
          new WeeklyBudgetTemplate({ name: "Semaine 4" }),
          new WeeklyBudgetTemplate({ name: "Semaine 5" }),
          new WeeklyBudgetTemplate({ name: "Semaine 6" }),
        ],
        outflows: [new OutflowTemplate({ label: "outflow", amount: 10 })],
      };

      // when / then
      expect(() => new MonthCreationTemplate(props)).to.throw(
        MonthCreationTemplateWeeklyBudgetError
      );
    });
  });
  describe("if there is not any outflows", function () {
    let clock = new Clock();

    afterEach(() => {
      clock.restore();
    });

    it("should throw MonthCreationOutflowsError", function () {
      // given
      clock.start(monthDate);

      const props = {
        weeklyBudgets: [
          new WeeklyBudgetTemplate({ name: "Semaine 1" }),
          new WeeklyBudgetTemplate({ name: "Semaine 2" }),
          new WeeklyBudgetTemplate({ name: "Semaine 3" }),
          new WeeklyBudgetTemplate({ name: "Semaine 4" }),
          new WeeklyBudgetTemplate({ name: "Semaine 5" }),
        ],
        outflows: [],
      };

      // when / then
      expect(() => new MonthCreationTemplate(props)).to.throw(
        MonthCreationOutflowsError
      );
    });
  });

  describe("#addMonthlyProjectForAmount", () => {
    it("should add the monthly project outflow", () => {
      // given
      const props = {
        weeklyBudgets: [
          new WeeklyBudgetTemplate({ name: "Semaine 1" }),
          new WeeklyBudgetTemplate({ name: "Semaine 2" }),
          new WeeklyBudgetTemplate({ name: "Semaine 3" }),
          new WeeklyBudgetTemplate({ name: "Semaine 4" }),
          new WeeklyBudgetTemplate({ name: "Semaine 5" }),
        ],
        outflows: [new OutflowTemplate({ label: "outflow", amount: 10 })],
      };
      const month = new MonthCreationTemplate(props);
      const expectedAmount = 120;

      // when
      month.addMonthlyProjectForAmount(expectedAmount);

      // then
      const expectedOutflow = month.outflows.find(
        (o) => o.label === "Projets mensuels"
      );
      if (!expectedOutflow) {
        expect.fail("expectedOutflow should be defined");
      }
      expect(expectedOutflow?.amount).to.be.equal(expectedAmount);
    });
  });
});
