import expect from "../../../../test-helpers.js";
import PendingDebit, {
  PendingDebitProps,
} from "../../../../../core/models/pending-debit/PendingDebit.js";

describe("unit | core | models | pending-debit | PendingDebit", () => {
  describe("#constructor", () => {
    it("should instantiate pending debit with right data", () => {
      // Given
      const props = {
        id: "c99d6518-9d68-424d-86ce-c14facaa6698",
        monthId: "523350a7-4082-4775-9510-79700370a9e6",
        monthDate: new Date("2022-01-01"),
        label: "label",
        amount: 10.34,
        type: "outflow",
      };

      // When
      const pendingDebit = new PendingDebit(props as PendingDebitProps);

      // Then
      expect(pendingDebit.id).to.be.deep.equal(props.id);
      expect(pendingDebit.monthId).to.be.deep.equal(props.monthId);
      expect(pendingDebit.monthDate).to.be.deep.equal(props.monthDate);
      expect(pendingDebit.label).to.be.deep.equal(
        `${props.label} (janv. 2022)`
      );
      expect(pendingDebit.amount).to.be.deep.equal(props.amount);
      expect(pendingDebit.type).to.be.deep.equal(props.type);
    });
  });
});
