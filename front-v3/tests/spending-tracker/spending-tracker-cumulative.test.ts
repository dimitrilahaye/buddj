import { describe, expect, it } from 'vitest';
import {
  cumulativeSpending,
  niceAxisTicks,
} from '../../src/application/spending-tracker/spending-tracker-cumulative.js';
import type { SpendingTrackerView } from '../../src/application/spending-tracker/spending-tracker-types.js';

function bucket(start: string, expensesTotal: number, outflowsTotal: number) {
  return {
    start,
    expensesTotal,
    outflowsTotal,
    total: Math.round((expensesTotal + outflowsTotal) * 100) / 100,
    entries: [],
  };
}

describe('cumul du suivi des dépenses', () => {
  it('cumule dépenses et sorties bucket après bucket, sans erreur d’arrondi', () => {
    const view: SpendingTrackerView = {
      granularity: 'day',
      from: '2026-11-01',
      to: '2026-11-03',
      total: 0.6,
      expensesTotal: 0.3,
      outflowsTotal: 0.3,
      buckets: [bucket('2026-11-01', 0.1, 0.2), bucket('2026-11-02', 0, 0), bucket('2026-11-03', 0.2, 0.1)],
    };

    expect(cumulativeSpending({ view })).toEqual([
      { start: '2026-11-01', bucketTotal: 0.3, expenses: 0.1, outflows: 0.2, total: 0.3 },
      { start: '2026-11-02', bucketTotal: 0, expenses: 0.1, outflows: 0.2, total: 0.3 },
      { start: '2026-11-03', bucketTotal: 0.3, expenses: 0.3, outflows: 0.3, total: 0.6 },
    ]);
  });

  it.each([
    [872.63, [0, 250, 500, 750, 1000]],
    [16.5, [0, 5, 10, 15, 20]],
    [100, [0, 25, 50, 75, 100]],
    [0, [0]],
  ])('gradue l’axe jusqu’à %s € avec des valeurs rondes', (max, ticks) => {
    expect(niceAxisTicks({ max })).toEqual(ticks);
  });
});
