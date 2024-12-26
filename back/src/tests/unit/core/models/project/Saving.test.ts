import expect, { Clock } from "../../../../test-helpers.js";
import ProjectName from "../../../../../core/models/project/ProjectName.js";
import ProjectTarget from "../../../../../core/models/project/ProjectTarget.js";
import TransferLogs from "../../../../../core/models/project/TransferLogs.js";
import Saving from "../../../../../core/models/project/Saving.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";
import TransferLog from "../../../../../core/models/project/TransferLog.js";

describe("Unit | Core | Models | Project | Saving", function () {
  describe("#constructor", function () {
    it("should give saving with right data", function () {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();

      // when
      const saving = new Saving("1", name, target, logs);

      // then
      expect(saving.id).to.deep.equal("1");
      expect(saving.name).to.deep.equal(name);
      expect(saving.target).to.deep.equal(target);
      expect(saving.logs).to.deep.equal(logs);
    });
  });

  describe("#updateName", () => {
    it("should update the name", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const saving = new Saving("1", name, target, logs);

      // when
      saving.updateName(new ProjectName("iPhone 12"));

      // then
      expect(saving.name.value).to.deep.equal("iPhone 12");
    });
  });

  describe("#updateTarget", () => {
    it("should update the name", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs();
      const saving = new Saving("1", name, target, logs);

      // when
      saving.updateTarget(new ProjectTarget(250));

      // then
      expect(saving.target.value).to.deep.equal(250);
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
      const saving = new Saving("1", name, target, logs);

      // when
      saving.add(new ProjectAmount(20));

      // then
      const lastLog = saving.logs.logs.at(-1);
      expect(lastLog?.amount.value).to.be.equal(20);
      expect(lastLog?.date.getTime()).to.be.equal(logDate.getTime());
      expect(lastLog?.isActive).to.be.true;
      expect(saving.leftAmount()).to.be.equal(180);
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
      const saving = new Saving("1", name, target, logs);

      // when
      const leftAmount = saving.leftAmount();

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
      const saving = new Saving("1", name, target, logs);

      // when
      const leftAmount = saving.leftAmount();

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
      const saving = new Saving("1", name, target, logs);

      // then
      expect(saving.canRollback()).to.be.true;
    });

    it("should return false if it can not rollback", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), false),
      ]);
      const saving = new Saving("1", name, target, logs);

      // then
      expect(saving.canRollback()).to.be.false;
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
      const saving = new Saving("1", name, target, logs);

      // then
      expect(saving.canReApply()).to.be.true;
    });

    it("should return false if it can not re-apply", () => {
      // given
      const name = new ProjectName("iPhone");
      const target = new ProjectTarget(200);
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(210), new Date("2021-01-01"), true),
      ]);
      const saving = new Saving("1", name, target, logs);

      // then
      expect(saving.canReApply()).to.be.false;
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
      const saving = new Saving("1", name, target, logs);

      expect(saving.leftAmount()).to.be.equal(190);

      // when
      saving.rollback();

      // then
      expect(saving.leftAmount()).to.be.equal(200);
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
      const saving = new Saving("1", name, target, logs);

      expect(saving.leftAmount()).to.be.equal(200);

      // when
      saving.reApply();

      // then
      expect(saving.leftAmount()).to.be.equal(190);
    });
  });
});
