import expect from "../../../../test-helpers.js";
import SavingsAccountTracker from "../../../../../core/models/savings-account/SavingsAccountTracker.js";
import SavingsAccountOperation, {
  SavingsAccountOperationType,
} from "../../../../../core/models/savings-account/SavingsAccountOperation.js";

function operation(
  type: SavingsAccountOperationType,
  amount: number,
  date: string
) {
  return new SavingsAccountOperation({
    id: `${type}-${date}-${amount}`,
    savingsAccountId: "account-id",
    type,
    amount,
    label: null,
    date,
  });
}

describe("Unit | Core | Models | SavingsAccountTracker", function () {
  it("should compute opening balance, totals and closing balance over the range", function () {
    // given
    const operations = [
      operation("deposit", 5000, "2026-10-01"),
      operation("withdrawal", 300, "2026-10-20"),
      operation("deposit", 200, "2026-11-03"),
      operation("withdrawal", 450.5, "2026-11-15"),
      operation("deposit", 100, "2026-12-01"),
    ];

    // when
    const tracker = new SavingsAccountTracker({
      savingsAccountId: "account-id",
      granularity: "month",
      from: "2026-11-01",
      to: "2026-11-30",
      operations,
    });

    // then
    expect(tracker.openingBalance).to.equal(4700);
    expect(tracker.depositsTotal).to.equal(200);
    expect(tracker.withdrawalsTotal).to.equal(450.5);
    expect(tracker.net).to.equal(-250.5);
    expect(tracker.closingBalance).to.equal(4449.5);
  });

  it("should fill empty buckets and carry balance and cumulative totals", function () {
    // given
    const operations = [
      operation("deposit", 1000, "2026-10-31"),
      operation("deposit", 50, "2026-11-01"),
      operation("withdrawal", 20, "2026-11-03"),
    ];

    // when
    const tracker = new SavingsAccountTracker({
      savingsAccountId: "account-id",
      granularity: "day",
      from: "2026-11-01",
      to: "2026-11-04",
      operations,
    });

    // then
    expect(tracker.buckets).to.deep.equal([
      {
        start: "2026-11-01",
        depositsTotal: 50,
        withdrawalsTotal: 0,
        balance: 1050,
        cumulativeDeposits: 50,
        cumulativeWithdrawals: 0,
      },
      {
        start: "2026-11-02",
        depositsTotal: 0,
        withdrawalsTotal: 0,
        balance: 1050,
        cumulativeDeposits: 50,
        cumulativeWithdrawals: 0,
      },
      {
        start: "2026-11-03",
        depositsTotal: 0,
        withdrawalsTotal: 20,
        balance: 1030,
        cumulativeDeposits: 50,
        cumulativeWithdrawals: 20,
      },
      {
        start: "2026-11-04",
        depositsTotal: 0,
        withdrawalsTotal: 0,
        balance: 1030,
        cumulativeDeposits: 50,
        cumulativeWithdrawals: 20,
      },
    ]);
  });

  it("should group operations by week starting on monday", function () {
    // when
    const tracker = new SavingsAccountTracker({
      savingsAccountId: "account-id",
      granularity: "week",
      from: "2026-11-04",
      to: "2026-11-12",
      operations: [
        operation("deposit", 10, "2026-11-04"),
        operation("deposit", 15, "2026-11-08"),
        operation("deposit", 5, "2026-11-10"),
      ],
    });

    // then
    expect(tracker.buckets.map((b) => [b.start, b.depositsTotal])).to.deep.equal(
      [
        ["2026-11-02", 25],
        ["2026-11-09", 5],
      ]
    );
  });
});
