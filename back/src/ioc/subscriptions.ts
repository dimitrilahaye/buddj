import EventSubscriber from "../core/ports/providers/EventSubscriber.js";
import TrackSpending from "../core/usecases/spending-tracker/TrackSpending.js";
import UntrackSpending from "../core/usecases/spending-tracker/UntrackSpending.js";
import UpdateTrackedSpending from "../core/usecases/spending-tracker/UpdateTrackedSpending.js";

type SubscriptionsDeps = {
  trackSpendingUsecase: TrackSpending;
  untrackSpendingUsecase: UntrackSpending;
  updateTrackedSpendingUsecase: UpdateTrackedSpending;
};

function registerSubscriptions(
  subscriber: EventSubscriber,
  {
    trackSpendingUsecase,
    untrackSpendingUsecase,
    updateTrackedSpendingUsecase,
  }: SubscriptionsDeps
) {
  subscriber.subscribe("expenseAdded", (event) =>
    trackSpendingUsecase.execute({
      kind: "expense",
      sourceId: event.expenseId,
      label: event.label,
      amount: event.amount,
      occurredAt: event.occurredAt,
    })
  );

  subscriber.subscribe("outflowChecked", (event) =>
    trackSpendingUsecase.execute({
      kind: "outflow",
      sourceId: event.outflowId,
      label: event.label,
      amount: event.amount,
      occurredAt: event.occurredAt,
    })
  );

  subscriber.subscribe("expenseDeleted", (event) =>
    untrackSpendingUsecase.execute({ kind: "expense", sourceId: event.expenseId })
  );

  subscriber.subscribe("outflowUnchecked", (event) =>
    untrackSpendingUsecase.execute({ kind: "outflow", sourceId: event.outflowId })
  );

  subscriber.subscribe("outflowDeleted", (event) =>
    untrackSpendingUsecase.execute({ kind: "outflow", sourceId: event.outflowId })
  );

  subscriber.subscribe("expenseUpdated", (event) =>
    updateTrackedSpendingUsecase.execute({
      kind: "expense",
      sourceId: event.expenseId,
      label: event.label,
      amount: event.amount,
    })
  );

  subscriber.subscribe("outflowUpdated", (event) =>
    updateTrackedSpendingUsecase.execute({
      kind: "outflow",
      sourceId: event.outflowId,
      label: event.label,
      amount: event.amount,
    })
  );
}

export { registerSubscriptions };
