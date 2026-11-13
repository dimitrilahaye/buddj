import sinon from "sinon";
import expect from "../../test-helpers.js";
import { registerSubscriptions } from "../../../ioc/subscriptions.js";
import { DomainEventName } from "../../../core/events/DomainEventMap.js";

describe("Unit | IoC | Subscriptions", function () {
  function setup() {
    const handlers = new Map<DomainEventName, (payload: any) => Promise<void>>();
    const subscriber = {
      subscribe: (name: DomainEventName, handler: any) =>
        handlers.set(name, handler),
    };
    const trackSpendingUsecase = { execute: sinon.stub().resolves() } as any;
    const untrackSpendingUsecase = { execute: sinon.stub().resolves() } as any;
    registerSubscriptions(subscriber, {
      trackSpendingUsecase,
      untrackSpendingUsecase,
    });
    return { handlers, trackSpendingUsecase, untrackSpendingUsecase };
  }

  it("should track an added expense", async function () {
    const { handlers, trackSpendingUsecase } = setup();
    const occurredAt = new Date();

    await handlers.get("expenseAdded")!({
      expenseId: "expense-id",
      label: "Courses",
      amount: 42,
      occurredAt,
    });

    expect(trackSpendingUsecase.execute).to.have.been.calledOnceWithExactly({
      kind: "expense",
      sourceId: "expense-id",
      label: "Courses",
      amount: 42,
      occurredAt,
    });
  });

  it("should track an added outflow", async function () {
    const { handlers, trackSpendingUsecase } = setup();
    const occurredAt = new Date();

    await handlers.get("outflowAdded")!({
      outflowId: "outflow-id",
      label: "EDF",
      amount: 114.62,
      occurredAt,
    });

    expect(trackSpendingUsecase.execute).to.have.been.calledOnceWithExactly({
      kind: "outflow",
      sourceId: "outflow-id",
      label: "EDF",
      amount: 114.62,
      occurredAt,
    });
  });

  it("should untrack a deleted expense", async function () {
    const { handlers, untrackSpendingUsecase } = setup();

    await handlers.get("expenseDeleted")!({ expenseId: "expense-id" });

    expect(untrackSpendingUsecase.execute).to.have.been.calledOnceWithExactly({
      kind: "expense",
      sourceId: "expense-id",
    });
  });

  it("should untrack a deleted outflow", async function () {
    const { handlers, untrackSpendingUsecase } = setup();

    await handlers.get("outflowDeleted")!({ outflowId: "outflow-id" });

    expect(untrackSpendingUsecase.execute).to.have.been.calledOnceWithExactly({
      kind: "outflow",
      sourceId: "outflow-id",
    });
  });
});
