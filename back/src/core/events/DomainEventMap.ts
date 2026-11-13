export type ExpenseAddedEvent = {
  expenseId: string;
  label: string;
  amount: number;
  occurredAt: Date;
};

export type ExpenseDeletedEvent = {
  expenseId: string;
};

export type OutflowAddedEvent = {
  outflowId: string;
  label: string;
  amount: number;
  occurredAt: Date;
};

export type OutflowDeletedEvent = {
  outflowId: string;
};

export type DomainEventMap = {
  expenseAdded: ExpenseAddedEvent;
  expenseDeleted: ExpenseDeletedEvent;
  outflowAdded: OutflowAddedEvent;
  outflowDeleted: OutflowDeletedEvent;
};

export type DomainEventName = keyof DomainEventMap;

export type DomainEventHandler<K extends DomainEventName> = (
  payload: DomainEventMap[K]
) => Promise<void>;
