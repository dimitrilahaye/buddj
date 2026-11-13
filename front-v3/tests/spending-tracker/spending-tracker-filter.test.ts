import { describe, expect, it } from 'vitest';
import { filterSpendingTrackerView } from '../../src/application/spending-tracker/spending-tracker-filter.js';
import type { SpendingTrackerView } from '../../src/application/spending-tracker/spending-tracker-types.js';

const view: SpendingTrackerView = {
  granularity: 'day',
  from: '2026-11-12',
  to: '2026-11-13',
  total: 156.72,
  expensesTotal: 42.1,
  outflowsTotal: 114.62,
  buckets: [
    {
      start: '2026-11-12',
      total: 156.72,
      expensesTotal: 42.1,
      outflowsTotal: 114.62,
      entries: [
        { id: 'edf', kind: 'outflow', label: 'EDF', amount: 114.62, occurredAt: '2026-11-12T08:00:00.000Z' },
        { id: 'courses', kind: 'expense', label: 'Courses', amount: 42.1, occurredAt: '2026-11-12T10:00:00.000Z' },
      ],
    },
    { start: '2026-11-13', total: 0, expensesTotal: 0, outflowsTotal: 0, entries: [] },
  ],
};

describe('filtre par type du suivi des dépenses', () => {
  it('garde tout quand les deux types sont cochés', () => {
    expect(filterSpendingTrackerView({ view, kinds: { expense: true, outflow: true } })).toEqual(view);
  });

  it('ne garde que les dépenses et recalcule les totaux', () => {
    const filtered = filterSpendingTrackerView({ view, kinds: { expense: true, outflow: false } });

    expect(filtered).toMatchObject({ total: 42.1, expensesTotal: 42.1, outflowsTotal: 0 });
    expect(filtered.buckets[0]).toMatchObject({ total: 42.1, expensesTotal: 42.1, outflowsTotal: 0 });
    expect(filtered.buckets[0]!.entries.map((e) => e.id)).toEqual(['courses']);
  });

  it('ne garde que les sorties et recalcule les totaux', () => {
    const filtered = filterSpendingTrackerView({ view, kinds: { expense: false, outflow: true } });

    expect(filtered).toMatchObject({ total: 114.62, expensesTotal: 0, outflowsTotal: 114.62 });
    expect(filtered.buckets[0]!.entries.map((e) => e.id)).toEqual(['edf']);
  });

  it('conserve les buckets vides', () => {
    const filtered = filterSpendingTrackerView({ view, kinds: { expense: true, outflow: false } });

    expect(filtered.buckets.map((b) => b.start)).toEqual(['2026-11-12', '2026-11-13']);
  });
});
