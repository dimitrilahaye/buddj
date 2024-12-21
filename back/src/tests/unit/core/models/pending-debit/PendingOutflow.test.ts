import expect from "../../../../test-helpers.js";
import PendingOutflow from "../../../../../core/models/pending-debit/PendingOutflow.js";
import AccountOutflow from "../../../../../core/models/month/account/AccountOutflow.js";

describe("unit | core | models | pending-debit | PendingOutflow", () => {
  describe("#constructor", () => {
    it("should instantiate pending debit with right data", () => {
      // Given
      const outflow = new AccountOutflow({
        id: "uuid",
        label: "outlfow",
        amount: 10.05,
        isChecked: true,
      });
      const monthDate = new Date("2022-01-01");

      // When
      const pendingOutflow = new PendingOutflow(outflow, monthDate);

      // Then
      expect(pendingOutflow.id).to.be.deep.equal(outflow.id);
      expect(pendingOutflow.label).to.be.deep.equal(
        `${outflow.label} (janv. 2022)`
      );
      expect(pendingOutflow.amount).to.be.deep.equal(outflow.amount);
    });
  });
});
