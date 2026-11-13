import { describe, expect, it } from 'vitest';
import {
  cumulativeSpending,
  hourlyCumulativeSpending,
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
      { key: '2026-11-01', bucketTotal: 0.3, expenses: 0.1, outflows: 0.2, total: 0.3 },
      { key: '2026-11-02', bucketTotal: 0, expenses: 0.1, outflows: 0.2, total: 0.3 },
      { key: '2026-11-03', bucketTotal: 0.3, expenses: 0.3, outflows: 0.3, total: 0.6 },
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

  describe('heure par heure', () => {
    const day = {
      start: '2026-11-13',
      total: 16.5,
      expensesTotal: 16.5,
      outflowsTotal: 0,
      entries: [
        { id: 'kebab', kind: 'expense' as const, label: 'Kebab', amount: 12, occurredAt: new Date(2026, 10, 13, 12, 15).toISOString() },
        { id: 'pain', kind: 'expense' as const, label: 'Pain', amount: 4.5, occurredAt: new Date(2026, 10, 13, 7, 30).toISOString() },
      ],
    };

    it('s’arrête à l’heure actuelle pour la journée en cours', () => {
      const points = hourlyCumulativeSpending({ bucket: day, now: new Date(2026, 10, 13, 14, 5) });

      expect(points.map((p) => p.key)).toEqual(Array.from({ length: 15 }, (_, h) => String(h)));
      expect(points[6]).toMatchObject({ total: 0 });
      expect(points[7]).toMatchObject({ bucketTotal: 4.5, total: 4.5 });
      expect(points[12]).toMatchObject({ bucketTotal: 12, total: 16.5 });
      expect(points[14]).toMatchObject({ bucketTotal: 0, total: 16.5 });
    });

    it('va jusqu’à 23 h pour une journée passée', () => {
      const points = hourlyCumulativeSpending({ bucket: day, now: new Date(2026, 10, 20, 9, 0) });

      expect(points).toHaveLength(24);
      expect(points.at(-1)).toMatchObject({ key: '23', total: 16.5 });
    });
  });
});
