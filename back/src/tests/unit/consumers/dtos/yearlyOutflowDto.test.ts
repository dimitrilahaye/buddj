import YearlyOutflow from "../../../../core/models/yearly-outflows/YearlyOutflow.js";
import YearlyOutflows from "../../../../core/models/yearly-outflows/YearlyOutflows.js";
import yearlyOutflowsDto from "../../../../consumers/api/dtos/yearlyOutflowsDto.js";
import expect from "../../../test-helpers.js";

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
      new YearlyOutflow({
        id: "id3",
        month: 4,
        label: "label",
        amount: 10,
      }),
    ];
    const yearlyOutflows = new YearlyOutflows(outflows);

    // when
    const dto = yearlyOutflowsDto(yearlyOutflows);

    // then
    expect(dto).to.deep.equal({
      1: [outflows[0], outflows[1]],
      2: [],
      3: [],
      4: [outflows[2]],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      10: [],
      11: [],
      12: [],
    });
  });
});
