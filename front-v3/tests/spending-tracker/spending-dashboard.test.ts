import { describe, expect, it } from 'vitest';
import {
  averageUnits,
  elapsedDays,
  spendingDashboard,
} from '../../src/application/spending-tracker/spending-dashboard.js';
import { categoryStack } from '../../src/application/spending-tracker/spending-chart-series.js';
import type { SpendingTrackerView, TrackedSpendingEntry } from '../../src/application/spending-tracker/spending-tracker-types.js';
import { categoryOfLabel } from '../../src/shared/emoji-categories.js';

function entry(id: string, label: string, amount: number, kind: TrackedSpendingEntry['kind'] = 'expense'): TrackedSpendingEntry {
  return { id, kind, label, amount, occurredAt: '2026-11-02T10:00:00.000Z' };
}

function viewOf(buckets: Array<{ start: string; entries: TrackedSpendingEntry[] }>, from: string, to: string): SpendingTrackerView {
  const sum = (entries: TrackedSpendingEntry[], kind?: string) =>
    Math.round(entries.filter((e) => !kind || e.kind === kind).reduce((a, e) => a + e.amount, 0) * 100) / 100;
  const all = buckets.flatMap((b) => b.entries);
  return {
    granularity: 'day',
    from,
    to,
    total: sum(all),
    expensesTotal: sum(all, 'expense'),
    outflowsTotal: sum(all, 'outflow'),
    buckets: buckets.map((b) => ({
      start: b.start,
      total: sum(b.entries),
      expensesTotal: sum(b.entries, 'expense'),
      outflowsTotal: sum(b.entries, 'outflow'),
      entries: b.entries,
    })),
  };
}

describe('catégorie d’un libellé', () => {
  it('suit l’emoji de tête, avec ou sans sélecteur de variante', () => {
    expect(categoryOfLabel('🍕 Pizza').id).toBe('food');
    expect(categoryOfLabel('⚡ EDF').id).toBe('energy');
    expect(categoryOfLabel('📱 Forfait').id).toBe('utilities');
    expect(categoryOfLabel('🚬 Tabac').id).toBe('misc');
    expect(categoryOfLabel('✈ Billet').id).toBe('transport');
  });

  it('range à part les libellés sans emoji connu', () => {
    expect(categoryOfLabel('Courses').id).toBe('uncategorized');
    expect(categoryOfLabel('🦄 Licorne').id).toBe('uncategorized');
  });
});

describe('moyennes du tableau de bord', () => {
  it('compte les jours écoulés, sans dépasser aujourd’hui', () => {
    expect(elapsedDays({ from: '2026-11-01', to: '2026-11-13', today: '2026-11-13' })).toBe(13);
    expect(elapsedDays({ from: '2026-11-01', to: '2026-11-30', today: '2026-11-13' })).toBe(13);
    expect(elapsedDays({ from: '2026-12-01', to: '2026-12-31', today: '2026-11-13' })).toBe(0);
  });

  it('ne propose une unité que si la période en couvre plus d’une', () => {
    expect(averageUnits({ days: 1 })).toEqual([]);
    expect(averageUnits({ days: 5 })).toEqual(['day']);
    expect(averageUnits({ days: 13 })).toEqual(['day', 'week']);
    expect(averageUnits({ days: 30 })).toEqual(['day', 'week']);
    expect(averageUnits({ days: 62 })).toEqual(['day', 'week', 'month']);
  });

  it('calcule totaux, moyennes et catégories de la plus coûteuse à la moins coûteuse', () => {
    const view = viewOf(
      [
        { start: '2026-11-01', entries: [entry('a', '🍕 Pizza', 12), entry('b', '⚡ EDF', 70, 'outflow')] },
        { start: '2026-11-02', entries: [entry('c', '🍎 Primeur', 8), entry('d', 'Divers', 4)] },
      ],
      '2026-11-01',
      '2026-11-02'
    );

    const dashboard = spendingDashboard({ view, today: '2026-11-13' });

    expect(dashboard.totals).toEqual({ total: 94, expensesTotal: 24, outflowsTotal: 70 });
    expect(dashboard.averages).toEqual([{ unit: 'day', total: 47, expensesTotal: 12, outflowsTotal: 35 }]);
    expect(dashboard.categories.map((c) => [c.id, c.total])).toEqual([
      ['energy', 70],
      ['food', 20],
      ['uncategorized', 4],
    ]);
    const food = dashboard.categories.find((c) => c.id === 'food')!;
    expect(food.averages).toEqual([{ unit: 'day', total: 10, expensesTotal: 10, outflowsTotal: 0 }]);
    expect(food.share).toBeCloseTo(20 / 94);
  });
});

describe('courbe par catégorie', () => {
  it('cumule chaque catégorie, la plus coûteuse en bas de la pile', () => {
    const view = viewOf(
      [
        { start: '2026-11-01', entries: [entry('a', '🍕 Pizza', 12), entry('b', '⚡ EDF', 70)] },
        { start: '2026-11-02', entries: [entry('c', '🍎 Primeur', 8)] },
      ],
      '2026-11-01',
      '2026-11-02'
    );

    const { series, points } = categoryStack({ view });

    expect(series.map((s) => s.label)).toEqual(['⚡ Énergie', '🍎 Alimentation']);
    expect(points).toEqual([
      { key: '2026-11-01', bucketTotal: 82, total: 82, values: { energy: 70, food: 12 } },
      { key: '2026-11-02', bucketTotal: 8, total: 90, values: { energy: 70, food: 20 } },
    ]);
  });

  it('regroupe les catégories au-delà des cinq plus coûteuses', () => {
    const labels = ['🍕 a', '⚡ b', '📱 c', '🚗 d', '🏠 e', '💊 f', '📚 g'];
    const view = viewOf(
      [{ start: '2026-11-01', entries: labels.map((label, i) => entry(String(i), label, 100 - i)) }],
      '2026-11-01',
      '2026-11-01'
    );

    const { series, points } = categoryStack({ view });

    expect(series).toHaveLength(6);
    expect(series.at(-1)!.label).toBe('Autres catégories');
    expect(points[0]!.values.other).toBe(95 + 94);
  });
});
