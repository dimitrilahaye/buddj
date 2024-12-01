import expect, { Clock } from "../../../../test-helpers.js";
import MonthlyTemplate from "../../../../../core/models/template/MonthlyTemplate.js";
import MonthlyWeeklyBudgetTemplate from "../../../../../core/models/template/MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "../../../../../core/models/template/MonthlyOutflowTemplate.js";
import {
  MonthlyTemplateOutflowsError,
  MonthlyTemplateBudgetError,
} from "../../../../../core/errors/MonthlyTemplateErrors.js";
import { idProviderStub, resetStubs } from "../../usecases/test-helpers.js";
import { after } from "mocha";

after(() => {
  resetStubs();
});

describe("Unit | Core | Models | Template | MonthlyTemplate", function () {
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
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
        outflows: [
          new MonthlyOutflowTemplate({
            id: "id",
            label: "outflow",
            amount: 10,
          }),
        ],
      };

      // when
      const month = new MonthlyTemplate(props);

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

    it("should throw MonthlyTemplateBudgetError if there is less than 5 weekly budgets", function () {
      // given
      clock.start(monthDate);

      const props = {
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
          }),
        ],
        outflows: [
          new MonthlyOutflowTemplate({
            id: "id",
            label: "outflow",
            amount: 10,
          }),
        ],
      };

      // when / then
      expect(() => new MonthlyTemplate(props)).to.throw(
        MonthlyTemplateBudgetError
      );
    });
    it("should throw MonthlyTemplateBudgetError if there is more than 5 weekly budgets", function () {
      // given
      clock.start(monthDate);

      const props = {
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 5",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 6",
            initialBalance: 200,
          }),
        ],
        outflows: [
          new MonthlyOutflowTemplate({
            id: "id",
            label: "outflow",
            amount: 10,
          }),
        ],
      };

      // when / then
      expect(() => new MonthlyTemplate(props)).to.throw(
        MonthlyTemplateBudgetError
      );
    });
  });
  describe("if there is not any outflows", function () {
    let clock = new Clock();

    afterEach(() => {
      clock.restore();
    });

    it("should throw MonthlyTemplateOutflowsError", function () {
      // given
      clock.start(monthDate);

      const props = {
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
        outflows: [],
      };

      // when / then
      expect(() => new MonthlyTemplate(props)).to.throw(
        MonthlyTemplateOutflowsError
      );
    });
  });

  describe("#addMonthlyProjectForAmount", () => {
    it("should add the monthly project outflow", () => {
      // given
      const expectedId = "id";
      idProviderStub.get.returns(expectedId);
      const props = {
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 1",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 2",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 3",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 4",
            initialBalance: 200,
          }),
          new MonthlyWeeklyBudgetTemplate({
            id: "id",
            name: "Semaine 5",
            initialBalance: 200,
          }),
        ],
        outflows: [
          new MonthlyOutflowTemplate({
            id: "id",
            label: "outflow",
            amount: 10,
          }),
        ],
      };
      const month = new MonthlyTemplate(props);
      const expectedAmount = 120;

      // when
      month.addMonthlyProjectForAmount(idProviderStub, expectedAmount);

      // then
      const expectedOutflow = month.outflows.find(
        (o) => o.label === "Projets mensuels"
      );
      if (!expectedOutflow) {
        expect.fail("expectedOutflow should be defined");
      }
      expect(expectedOutflow?.amount).to.be.equal(expectedAmount);
      expect(expectedOutflow?.id).to.be.equal(expectedId);
    });
  });
});
