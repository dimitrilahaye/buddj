export type ExpenseAddedEvent = {
  expenseId: string;
  label: string;
  amount: number;
  occurredAt: Date;
};

export type ExpenseDeletedEvent = {
  expenseId: string;
};

export type OutflowCheckedEvent = {
  outflowId: string;
  label: string;
  amount: number;
  occurredAt: Date;
};

export type OutflowUncheckedEvent = {
  outflowId: string;
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
  outflowChecked: OutflowCheckedEvent;
  outflowUnchecked: OutflowUncheckedEvent;
  outflowDeleted: OutflowDeletedEvent;
  expenseUpdated: ExpenseUpdatedEvent;
  outflowUpdated: OutflowUpdatedEvent;
};

export type DomainEventName = keyof DomainEventMap;

export type DomainEventHandler<K extends DomainEventName> = (
  payload: DomainEventMap[K]
) => Promise<void>;
