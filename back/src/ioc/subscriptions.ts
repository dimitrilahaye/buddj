import EventSubscriber from "../core/ports/providers/EventSubscriber.js";
import TrackSpending from "../core/usecases/spending-tracker/TrackSpending.js";
import UntrackSpending from "../core/usecases/spending-tracker/UntrackSpending.js";

type SubscriptionsDeps = {
  trackSpendingUsecase: TrackSpending;
  untrackSpendingUsecase: UntrackSpending;
};

function registerSubscriptions(
  subscriber: EventSubscriber,
  { trackSpendingUsecase, untrackSpendingUsecase }: SubscriptionsDeps
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

  subscriber.subscribe("outflowAdded", (event) =>
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

  subscriber.subscribe("outflowDeleted", (event) =>
    untrackSpendingUsecase.execute({ kind: "outflow", sourceId: event.outflowId })
  );
}

export { registerSubscriptions };
