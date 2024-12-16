import expect from "../../../../test-helpers.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";
import {
  YearlySavingsAddError,
  YearlySavingsIdDoesNotExistError,
} from "../../../../../core/errors/YearlyOutflowsErrors.js";
import YearlyBudget from "../../../../../core/models/yearly-outflows/YearlyBudget.js";

describe("Unit | Core | Models | Yearly outflows | YearlyOutflows", () => {
  describe("#constructor", () => {
    it("should return a yearly savings list with right data", () => {
      // given
      const outflows = [
        new YearlyOutflow({
          id: "id1",
          month: 1,
          label: "label",
          amount: 10,
        }),
        new YearlyOutflow({
          id: "id2",
          month: 1,
          label: "label",
          amount: 10,
        }),
      ];
      const budgets = [
        new YearlyBudget({
          id: "id1",
          month: 1,
          name: "label",
          initialBalance: 10,
        }),
      ];

      // when
      const yearlyOutflows = new YearlyOutflows(outflows, budgets);

      // then
      expect(yearlyOutflows.getAll()).to.have.length(
        outflows.length + budgets.length
      );
    });
  });

  describe("#getMonthlyProjectsAmount", () => {
    it("should return the total for the monthly projects", () => {
      // given
      const outflows = [
        new YearlyOutflow({
          id: "id1",
          month: 1,
          label: "label",
          amount: 100,
        }),
        new YearlyOutflow({
          id: "id2",
          month: 1,
          label: "label",
          amount: 10,
        }),
      ];
      const yearlyOutflows = new YearlyOutflows(outflows, [
        new YearlyBudget({
          id: "id2",
          month: 1,
          name: "label",
          initialBalance: 10,
        }),
      ]);

      // when
      const total = yearlyOutflows.getMonthlyProjectsAmount();

      // then
      expect(total).to.be.equal(10);
    });
  });

  describe("#add", () => {
    describe("When month is not correct", () => {
      it("should throw an error", () => {
        // given
        const yearlyOutflows = new YearlyOutflows([]);
        const incorrectMonthNumber = 13;

        // when / then
        expect(() =>
          yearlyOutflows.add(
            new YearlyOutflow({
              id: "id2",
              month: incorrectMonthNumber,
              label: "label",
              amount: 10,
            })
          )
        ).to.throw(YearlySavingsAddError);
      });
    });

    describe("When month is correct", () => {
      it("should add the outflow to its list", () => {
        // given
        const yearlyOutflows = new YearlyOutflows([]);

        // when
        yearlyOutflows.add(
          new YearlyOutflow({
            id: "id2",
            month: 12,
            label: "label",
            amount: 10,
          })
        );

        // then
        expect(yearlyOutflows.getAll()).to.have.length(1);
      });
    });
  });

  describe("#remove", () => {
    describe("When outflow does not exist", () => {
      it("should throw an error", () => {
        // given
        const yearlyOutflows = new YearlyOutflows(
          [
            new YearlyOutflow({
              id: "123",
              month: 12,
              label: "label",
              amount: 10,
            }),
          ],
          [
            new YearlyBudget({
              id: "456",
              month: 12,
              name: "label",
              initialBalance: 10,
            }),
          ]
        );

        // when / then
        expect(() => yearlyOutflows.remove("id")).to.throw(
          YearlySavingsIdDoesNotExistError
        );
      });
    });

    it("should remove the outflow from its list", () => {
      // given
      const expectedId = "id";
      const yearlyOutflows = new YearlyOutflows(
        [
          new YearlyOutflow({
            id: expectedId,
            month: 12,
            label: "label",
            amount: 10,
          }),
        ],
        [
          new YearlyBudget({
            id: "123",
            month: 12,
            name: "label",
            initialBalance: 10,
          }),
        ]
      );

      // when
      yearlyOutflows.remove(expectedId);

      // then
      expect(yearlyOutflows.getAll()).to.have.length(1);
    });

    it("should remove the budget from its list", () => {
      // given
      const expectedId = "id";
      const yearlyOutflows = new YearlyOutflows(
        [
          new YearlyOutflow({
            id: "123",
            month: 12,
            label: "label",
            amount: 10,
          }),
        ],
        [
          new YearlyBudget({
            id: expectedId,
            month: 12,
            name: "label",
            initialBalance: 10,
          }),
        ]
      );

      // when
      yearlyOutflows.remove(expectedId);

      // then
      expect(yearlyOutflows.getAll()).to.have.length(1);
    });
  });
});
