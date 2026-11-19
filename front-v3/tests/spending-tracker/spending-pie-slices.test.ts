import { describe, expect, it } from 'vitest';
import { pieSlices } from '../../src/application/spending-tracker/spending-pie-slices.js';

describe('parts de la répartition en anneau', () => {
  const series = [
    { key: 'other', label: 'Autres catégories', color: '#7d8090' },
    { key: 'food', label: 'Alimentation', color: '#3987e5' },
    { key: 'home', label: 'Logement', color: '#d95926' },
    { key: 'leisure', label: 'Loisirs', color: '#199e70' },
  ];

  it('prend le cumul final de chaque série, de la plus grande à la plus petite, « Autres catégories » en dernier, sans part nulle', () => {
    const slices = pieSlices({
      series,
      points: [
        { key: '2026-11-01', bucketTotal: 10, total: 10, values: { other: 10, food: 0, home: 0, leisure: 0 } },
        { key: '2026-11-02', bucketTotal: 190, total: 200, values: { other: 50, food: 50, home: 100, leisure: 0 } },
      ],
    });
    expect(slices.map((s) => [s.label, s.amount, s.share, s.color])).toEqual([
      ['Logement', 100, 0.5, '#d95926'],
      ['Alimentation', 50, 0.25, '#3987e5'],
      ['Autres catégories', 50, 0.25, '#7d8090'],
    ]);
  });

  it('ne donne aucune part sans dépense', () => {
    expect(pieSlices({ series, points: [] })).toEqual([]);
  });
});
