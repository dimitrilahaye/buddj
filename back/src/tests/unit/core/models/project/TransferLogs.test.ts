import expect, { test } from "../../../../test-helpers.js";
import TransferLogs from "../../../../../core/models/project/TransferLogs.js";
import TransferLog from "../../../../../core/models/project/TransferLog.js";
import {
  AddedInactiveLogError,
  AddedOlderLogError,
} from "../../../../../core/errors/ProjectErrors.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";

describe("Unit | Core | Models | Project | TransferLogs", function () {
  describe("#constructor", function () {
    it("should give transfer logs with right data", function () {
      // given
      const list = [
        new TransferLog(new ProjectAmount(10), new Date("2023-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01")),
      ];

      // when
      const logs = new TransferLogs(list);

      // then
      expect(logs.logs).to.deep.equal([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01")),
        new TransferLog(new ProjectAmount(10), new Date("2023-01-01")),
      ]);
    });

    it("should give transfer logs with default empty list", function () {
      // given
      const logs = new TransferLogs();

      // then
      expect(logs.logs).to.deep.equal([]);
    });
  });

  describe("#getActiveLogs", () => {
    it("should return all active logs", () => {
      // given
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2023-01-01"), false),
      ]);

      // when
      const activeLogs = logs.getActiveLogs();

      // then
      expect(activeLogs).to.deep.equal([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01"), true),
      ]);
    });
  });

  describe("#add", () => {
    it("should add a new log and remove all previous inactive logs", () => {
      // given
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2023-01-01"), false),
      ]);

      // when
      logs.add(
        new TransferLog(new ProjectAmount(10), new Date("2024-01-01"), true)
      );

      // then
      expect(logs.logs).to.deep.equal([
        new TransferLog(new ProjectAmount(10), new Date("2021-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01"), true),
        new TransferLog(new ProjectAmount(10), new Date("2024-01-01"), true),
      ]);
    });

    it("should throw an error if added log is inactive", () => {
      // given
      const inactiveLog = new TransferLog(
        new ProjectAmount(10),
        new Date(),
        false
      );
      const logs = new TransferLogs();

      // when / then
      expect(() => logs.add(inactiveLog)).to.throw(AddedInactiveLogError);
    });

    it("should throw an error if added a log older than last added log", () => {
      // given
      const olderLog = new TransferLog(
        new ProjectAmount(10),
        new Date("2021-01-01"),
        true
      );
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date("2022-01-01"), true),
      ]);

      // when / then
      expect(() => logs.add(olderLog)).to.throw(AddedOlderLogError);
    });
  });

  describe("#canReApply", () => {
    describe("It can not re-apply", () => {
      test("when logs list is empty", () => {
        // given
        const logs = new TransferLogs();

        // then
        expect(logs.canReApply()).to.be.false;
      });

      test("When not any log can be re-applied", () => {
        // given
        const logs = new TransferLogs([
          new TransferLog(new ProjectAmount(10), new Date(), true),
          new TransferLog(new ProjectAmount(10), new Date(), true),
        ]);

        // then
        expect(logs.canReApply()).to.be.false;
      });
    });

    it("can be re-applied when there are at least one inactive log", () => {
      // given
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date(), true),
        new TransferLog(new ProjectAmount(10), new Date(), false),
      ]);

      // then
      expect(logs.canReApply()).to.be.true;
    });
  });

  describe("#canRollback", () => {
    describe("It can not rollback", () => {
      test("when logs list is empty", () => {
        // given
        const logs = new TransferLogs();

        // then
        expect(logs.canRollback()).to.be.false;
      });

      test("when not any log can be rollback", () => {
        // given
        const logs = new TransferLogs([
          new TransferLog(new ProjectAmount(10), new Date(), false),
          new TransferLog(new ProjectAmount(10), new Date(), false),
        ]);

        // then
        expect(logs.canRollback()).to.be.false;
      });
    });

    it("can rollback when last log can rollback", () => {
      // given
      const logs = new TransferLogs([
        new TransferLog(new ProjectAmount(10), new Date(), false),
        new TransferLog(new ProjectAmount(10), new Date(), true),
      ]);

      // then
      expect(logs.canRollback()).to.be.true;
    });
  });

  describe("#rollback", () => {
    it("should do nothing if logs can not be rollback", () => {
      // given
      const firstLog = new TransferLog(
        new ProjectAmount(10),
        new Date(),
        false
      );
      const secondLog = new TransferLog(
        new ProjectAmount(10),
        new Date(),
        false
      );
      const logs = new TransferLogs([firstLog, secondLog]);

      // when
      logs.rollback();

      // then
      expect(logs.logs.at(0)).to.deep.equal(firstLog);
      expect(logs.logs.at(1)).to.deep.equal(secondLog);
    });

    it("should rollback the last active log", () => {
      // given
      const firstLog = new TransferLog(
        new ProjectAmount(10),
        new Date("2021-01-01"),
        true
      );
      const secondLog = new TransferLog(
        new ProjectAmount(10),
        new Date("2022-01-01"),
        false
      );
      const logs = new TransferLogs([firstLog, secondLog]);

      // when
      logs.rollback();

      // then
      expect(firstLog.isActive).to.be.false;
      expect(secondLog.isActive).to.be.false;
    });
  });

  describe("#reApply", () => {
    it("should do nothing if logs can not be re-applied", () => {
      // given
      const firstLog = new TransferLog(new ProjectAmount(10), new Date(), true);
      const secondLog = new TransferLog(
        new ProjectAmount(10),
        new Date(),
        true
      );
      const logs = new TransferLogs([firstLog, secondLog]);

      // when
      logs.reApply();

      // then
      expect(logs.logs.at(0)).to.deep.equal(firstLog);
      expect(logs.logs.at(1)).to.deep.equal(secondLog);
    });

    it("should re-apply the first inactive log", () => {
      // given
      const firstLog = new TransferLog(
        new ProjectAmount(10),
        new Date("2021-01-01"),
        false
      );
      const secondLog = new TransferLog(
        new ProjectAmount(10),
        new Date("2022-01-01"),
        false
      );
      const logs = new TransferLogs([firstLog, secondLog]);

      // when
      logs.reApply();

      // then
      expect(firstLog.isActive).to.be.true;
      expect(secondLog.isActive).to.be.false;
    });
  });
});
