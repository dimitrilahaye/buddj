import expect from "../../../../test-helpers.js";
import YearlyOutflow from "../../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../../../core/models/yearly-outflows/YearlyOutflows.js";
import {
  YearlyOutflowsAddError,
  YearlyOutflowsIdDoesNotExistError,
} from "../../../../../core/errors/YearlyOutflowsErrors.js";

describe.only("Unit | Core | Models | Yearly outflows | YearlyOutflows", () => {
  describe("#constructor", () => {
    it("should return a yearly outflows list with right data", () => {
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

      // when
      const yearlyOutflows = new YearlyOutflows(outflows);

      // then
      expect(yearlyOutflows.getAll()).to.have.length(outflows.length);
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
        ).to.throw(YearlyOutflowsAddError);
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
        const yearlyOutflows = new YearlyOutflows([]);

        // when / then
        expect(() => yearlyOutflows.remove("id")).to.throw(
          YearlyOutflowsIdDoesNotExistError
        );
      });
    });

    describe("When month is correct", () => {
      it("should remove the outflow from its list", () => {
        // given
        const expectedId = "id";
        const yearlyOutflows = new YearlyOutflows([
          new YearlyOutflow({
            id: expectedId,
            month: 12,
            label: "label",
            amount: 10,
          }),
        ]);

        // when
        yearlyOutflows.remove(expectedId);

        // then
        expect(yearlyOutflows.getAll()).to.have.length(0);
      });
    });
  });
});
