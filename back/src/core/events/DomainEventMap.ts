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

export type ExpenseUpdatedEvent = {
  expenseId: string;
  label: string;
  amount: number;
};

export type OutflowUpdatedEvent = {
  outflowId: string;
  label: string;
  amount: number;
};

export type DomainEventMap = {
  expenseAdded: ExpenseAddedEvent;
  expenseDeleted: ExpenseDeletedEvent;
  outflowAdded: OutflowAddedEvent;
  outflowDeleted: OutflowDeletedEvent;
  expenseUpdated: ExpenseUpdatedEvent;
  outflowUpdated: OutflowUpdatedEvent;
};

export type DomainEventName = keyof DomainEventMap;

export type DomainEventHandler<K extends DomainEventName> = (
  payload: DomainEventMap[K]
) => Promise<void>;
