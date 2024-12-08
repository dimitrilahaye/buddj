import expect, { Clock } from "../../../../test-helpers.js";
import MonthlyTemplate from "../../../../../core/models/monthly-template/MonthlyTemplate.js";
import MonthlyWeeklyBudgetTemplate from "../../../../../core/models/monthly-template/MonthlyBudgetTemplate.js";
import MonthlyOutflowTemplate from "../../../../../core/models/monthly-template/MonthlyOutflowTemplate.js";
import {
  MonthlyTemplateNameCanNotBeEmptyError,
  MonthlyTemplateOutflowsError,
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
        budgets: [],
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
        budgets: [],
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

  describe("#updateName", () => {
    const month = new MonthlyTemplate({
      id: "id",
      name: "template",
      isDefault: true,
      budgets: [],
      outflows: [
        new MonthlyOutflowTemplate({
          id: "id",
          label: "outflow",
          amount: 10,
        }),
      ],
    });
    it("should update the template name", () => {
      // given
      const expectedNewName = "New template name";

      // when
      month.updateName(expectedNewName);

      // then
      expect(month.name).to.equal(expectedNewName);
    });
    describe("if new name is empty", () => {
      it("should throw an error", () => {
        // when / then
        expect(() => month.updateName("")).to.throw(
          MonthlyTemplateNameCanNotBeEmptyError
        );
      });
    });
  });

  describe("#updateIsDefault", () => {
    it("should update the template isDefault value", () => {
      // given
      const month = new MonthlyTemplate({
        id: "id",
        name: "template",
        isDefault: true,
        budgets: [],
        outflows: [
          new MonthlyOutflowTemplate({
            id: "id",
            label: "outflow",
            amount: 10,
          }),
        ],
      });
      const expectedNewIsDefault = false;

      // when
      month.updateIsDefault(expectedNewIsDefault);

      // then
      expect(month.isDefault).to.equal(expectedNewIsDefault);
    });
  });
});
