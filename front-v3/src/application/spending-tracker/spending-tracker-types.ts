/** Regroupement des dépenses : par jour, par semaine (lundi) ou par mois. */
export type SpendingGranularity = 'day' | 'week' | 'month';

export type TrackedSpendingKind = 'expense' | 'outflow';

/** Raccourcis de plage proposés à l'écran. */
export type SpendingRangeShortcut = 'today' | 'week' | 'month';

/** Plage de jours calendaires inclusifs, au format YYYY-MM-DD. */
export type SpendingRange = { from: string; to: string };

export type SpendingKindsFilter = Record<TrackedSpendingKind, boolean>;

export type TrackedSpendingEntry = {
  id: string;
  kind: TrackedSpendingKind;
  label: string;
  amount: number;
  /** Instant ISO 8601 */
  occurredAt: string;
};

export type SpendingBucket = {
  /** Premier jour du bucket (YYYY-MM-DD) */
  start: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  /** Triées par montant décroissant */
  entries: TrackedSpendingEntry[];
};

export type SpendingTrackerView = {
  granularity: SpendingGranularity;
  from: string;
  to: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  buckets: SpendingBucket[];
};

/** Payload `data` de GET /spending-tracker */
export type ApiSpendingTrackerPayload = {
  granularity: SpendingGranularity;
  from: string;
  to: string;
  total: number;
  expensesTotal: number;
  outflowsTotal: number;
  buckets: Array<{
    start: string;
    total: number;
    expensesTotal: number;
    outflowsTotal: number;
    entries: Array<{
      id: string;
      kind: TrackedSpendingKind;
      sourceId: string;
      label: string;
      amount: number;
      occurredAt: string;
    }>;
  }>;
};
