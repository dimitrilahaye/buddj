import expect from "../../../test-helpers.js";
import projectDto from "../../../../consumers/api/dtos/projectDto.js";
import ProjectName from "../../../../core/models/project/ProjectName.js";
import ProjectTarget from "../../../../core/models/project/ProjectTarget.js";
import Saving from "../../../../core/models/project/Saving.js";
import Refund from "../../../../core/models/project/Refund.js";
import TransferLogs from "../../../../core/models/project/TransferLogs.js";
import TransferLog from "../../../../core/models/project/TransferLog.js";
import ProjectAmount from "../../../../core/models/project/ProjectAmount.js";

describe("Unit | Consumers | Dtos | projectDto", function () {
  describe("For Refund", function () {
    it("should return a Refund DTO with right data", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const refund = new Refund("1", name, target, logs);

      // when
      const dto = projectDto(refund);

      // then
      expect(dto).to.deep.equal({
        id: "1",
        name: "iPhone",
        target: 200,
        totalAmount: 0,
        canRollback: false,
        canReApply: false,
        canFinish: false,
        category: "refund",
      });
    });
  });

  describe("For Saving", function () {
    it("should return a Saving DTO with right data", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const refund = new Saving("1", name, target, logs);

      // when
      const dto = projectDto(refund);

      // then
      expect(dto).to.deep.equal({
        id: "1",
        name: "iPhone",
        target: 200,
        totalAmount: 0,
        canRollback: false,
        canReApply: false,
        canFinish: false,
        category: "saving",
      });
    });
  });

  it("should return right left amount, can rollback and can finish", () => {
    // given
    const name = new ProjectName("iPhone");
    const target = new ProjectTarget(200);
    const logs = new TransferLogs([
      new TransferLog(new ProjectAmount(200), new Date()),
    ]);
    const saving = new Saving("1", name, target, logs);

    // when
    const dto = projectDto(saving);

    // then
    expect(dto).to.deep.equal({
      id: "1",
      name: "iPhone",
      target: 200,
      totalAmount: 200,
      canRollback: true,
      canReApply: false,
      canFinish: true,
      category: "saving",
    });
  });

  it("should return right can re-apply", () => {
    // given
    const name = new ProjectName("iPhone");
    const target = new ProjectTarget(200);
    const logs = new TransferLogs([
      new TransferLog(new ProjectAmount(10), new Date(), false),
    ]);
    const saving = new Saving("1", name, target, logs);

    // when
    const dto = projectDto(saving);

    // then
    expect(dto).to.deep.equal({
      id: "1",
      name: "iPhone",
      target: 200,
      totalAmount: 0,
      canRollback: false,
      canReApply: true,
      canFinish: false,
      category: "saving",
    });
  });
});
