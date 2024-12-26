import expect from "../../../../test-helpers.js";
import TransferLog from "../../../../../core/models/project/TransferLog.js";
import ProjectAmount from "../../../../../core/models/project/ProjectAmount.js";

describe("Unit | Core | Models | Project | TransferLog", function () {
  describe("#constructor", function () {
    it("should give a transfer log with right data", function () {
      // given
      const amount = new ProjectAmount(10);
      const date = new Date();
      const isActive = false;

      // when
      const log = new TransferLog(amount, date, isActive);

      // then
      expect(log.amount).to.be.equal(amount);
      expect(log.date).to.be.equal(date);
      expect(log.isActive).to.be.equal(isActive);
    });

    it("should give a transfer log with default isActive attribute", function () {
      // given
      const amount = new ProjectAmount(10);
      const date = new Date();

      // when
      const log = new TransferLog(amount, date);

      // then
      expect(log.amount).to.be.equal(amount);
      expect(log.date).to.be.equal(date);
      expect(log.isActive).to.be.equal(true);
    });
  });

  describe("#setActive", () => {
    it("should set isActive at true", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), false);

      // when
      log.setActive();

      // then
      expect(log.isActive).to.be.true;
    });
  });

  describe("#setInactive", () => {
    it("should set isActive at false", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), false);

      // when
      log.setInactive();

      // then
      expect(log.isActive).to.be.false;
    });
  });

  describe("#canBeReApplied", () => {
    it("should return true when log is inactive", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), false);

      // when
      const canBeReApplied = log.canBeReApplied();

      // then
      expect(canBeReApplied).to.be.true;
    });

    it("should return false when log is active", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), true);

      // when
      const canBeReApplied = log.canBeReApplied();

      // then
      expect(canBeReApplied).to.be.false;
    });
  });

  describe("#canBeRollback", () => {
    it("should return false when log is inactive", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), false);

      // when
      const canBeRollback = log.canBeRollback();

      // then
      expect(canBeRollback).to.be.false;
    });

    it("should return true when log is active", () => {
      // given
      const log = new TransferLog(new ProjectAmount(10), new Date(), true);

      // when
      const canBeRollback = log.canBeRollback();

      // then
      expect(canBeRollback).to.be.true;
    });
  });
});
