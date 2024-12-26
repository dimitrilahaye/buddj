import expect, { Clock } from "../../../../test-helpers.js";
import ProjectName from "../../../../../core/models/project/ProjectName.js";
import ProjectTarget from "../../../../../core/models/project/ProjectTarget.js";
import TransferLogs from "../../../../../core/models/project/TransferLogs.js";
import Refund from "../../../../../core/models/project/Refund.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";
import TransferLog from "../../../../../core/models/project/TransferLog.js";

describe("Unit | Core | Models | Project | Refund", function () {
  describe("#constructor", function () {
    it("should give refund with right data", function () {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();

      // when
      const refund = new Refund("1", name, target, logs);

      // then
      expect(refund.id).to.deep.equal("1");
      expect(refund.name).to.deep.equal(name);
      expect(refund.target).to.deep.equal(target);
      expect(refund.logs).to.deep.equal(logs);
    });
  });

  describe("#updateName", () => {
    it("should update the name", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const refund = new Refund("1", name, target, logs);

      // when
      refund.updateName(new ProjectName("iPhone 12"));

      // then
      expect(refund.name.value).to.deep.equal("iPhone 12");
    });
  });

  describe("#updateTarget", () => {
    it("should update the name", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const refund = new Refund("1", name, target, logs);

      // when
      refund.updateTarget(new ProjectTarget(250));

      // then
      expect(refund.target.value).to.deep.equal(250);
    });
  });

  describe("#add", () => {
    const logDate = new Date("2024-01-01");
    let clock = new Clock();

    afterEach(() => {
      clock.restore();
    });

    it("should add the log", () => {
      // given
      clock.start(logDate);
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), false),
      ]);
      const refund = new Refund("1", name, target, logs);

      // when
      refund.add(new ProjectAmount(20));

      // then
      const lastLog = refund.logs.logs.at(-1);
      expect(lastLog?.amount.value).to.be.equal(20);
      expect(lastLog?.date.getTime()).to.be.equal(logDate.getTime());
      expect(lastLog?.isActive).to.be.true;
      expect(refund.leftAmount()).to.be.equal(180);
    });
  });

  describe("#leftAmount", () => {
    it("should return the right left amount when left is positive", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2023-01-01"), false),
      ]);
      const refund = new Refund("1", name, target, logs);

      // when
      const leftAmount = refund.leftAmount();

      // then
      expect(leftAmount).to.be.equal(180);
    });

    it("should return the right left amount when left is not positive", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01")),
      ]);
      const refund = new Refund("1", name, target, logs);

      // when
      const leftAmount = refund.leftAmount();

      // then
      expect(leftAmount).to.be.equal(0);
    });
  });

  describe("#canRollback", () => {
    it("should return true if it can rollback", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), true),
      ]);
      const refund = new Refund("1", name, target, logs);

      // then
      expect(refund.canRollback()).to.be.true;
    });

    it("should return false if it can not rollback", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), false),
      ]);
      const refund = new Refund("1", name, target, logs);

      // then
      expect(refund.canRollback()).to.be.false;
    });
  });

  describe("#canReApply", () => {
    it("should return true if it can re-apply", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), false),
      ]);
      const refund = new Refund("1", name, target, logs);

      // then
      expect(refund.canReApply()).to.be.true;
    });

    it("should return false if it can not re-apply", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), true),
      ]);
      const refund = new Refund("1", name, target, logs);

      // then
      expect(refund.canReApply()).to.be.false;
    });
  });

  describe("#rollback", () => {
    it("should rollback the amounts", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), true),
      ]);
      const refund = new Refund("1", name, target, logs);

      expect(refund.leftAmount()).to.be.equal(190);

      // when
      refund.rollback();

      // then
      expect(refund.leftAmount()).to.be.equal(200);
    });
  });

  describe("#reApply", () => {
    it("should re-apply the amounts", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), false),
      ]);
      const refund = new Refund("1", name, target, logs);

      expect(refund.leftAmount()).to.be.equal(200);

      // when
      refund.reApply();

      // then
      expect(refund.leftAmount()).to.be.equal(190);
    });
  });
});
