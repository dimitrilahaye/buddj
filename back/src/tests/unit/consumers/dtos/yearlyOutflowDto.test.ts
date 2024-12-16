import YearlyOutflow from "../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../../core/models/yearly-outflows/YearlyOutflows.js";
import yearlyOutflowsDto from "../../../../consumers/api/dtos/yearlyOutflowsDto.js";
import expect from "../../../test-helpers.js";
import YearlyBudget from "../../../../core/models/yearly-outflows/YearlyBudget.js";

describe("Unit | Consumers | Dtos | yearlyOutflowsDto", function () {
  it("should return a YearlyOutflows DTO with right data", () => {
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
        id: "id3",
        month: 4,
        name: "label",
        initialBalance: 10,
      }),
    ];

    const yearlyOutflows = new YearlyOutflows(outflows, budgets);

    // when
    const dto = yearlyOutflowsDto(yearlyOutflows);

    // then
    expect(dto).to.deep.equal({
      1: {
        outflows: [outflows[0], outflows[1]],
        budgets: [],
      },
      2: {
        outflows: [],
        budgets: [],
      },
      3: {
        outflows: [],
        budgets: [],
      },
      4: {
        outflows: [],
        budgets: [budgets[0]],
      },
      5: {
        outflows: [],
        budgets: [],
      },
      6: {
        outflows: [],
        budgets: [],
      },
      7: {
        outflows: [],
        budgets: [],
      },
      8: {
        outflows: [],
        budgets: [],
      },
      9: {
        outflows: [],
        budgets: [],
      },
      10: {
        outflows: [],
        budgets: [],
      },
      11: {
        outflows: [],
        budgets: [],
      },
      12: {
        outflows: [],
        budgets: [],
      },
    });
  });
});
