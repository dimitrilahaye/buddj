import { describe, expect, it } from 'vitest';
import {
  granularityForRange,
  isValidRange,
  rangeForShortcut,
  todayIso,
} from '../../src/application/spending-tracker/spending-tracker-range.js';

describe('plage du suivi des dépenses', () => {
  // 2026-11-13 est un vendredi
  const today = '2026-11-13';

  it.each([
    ['today', { from: '2026-11-13', to: '2026-11-13' }],
    ['week', { from: '2026-11-09', to: '2026-11-13' }],
    ['month', { from: '2026-11-01', to: '2026-11-13' }],
  ] as const)('le raccourci %s va du début de la période à aujourd’hui', (shortcut, expected) => {
    expect(rangeForShortcut({ shortcut, today })).toEqual(expected);
  });

  it('la semaine commence le lundi précédent quand on est dimanche', () => {
    expect(rangeForShortcut({ shortcut: 'week', today: '2026-11-15' })).toEqual({
      from: '2026-11-09',
      to: '2026-11-15',
    });
  });

  it.each([
    [{ from: '2026-11-13', to: '2026-11-13' }, 'day'],
    [{ from: '2026-10-14', to: '2026-11-13' }, 'day'],
    [{ from: '2026-10-13', to: '2026-11-13' }, 'week'],
    [{ from: '2026-05-16', to: '2026-11-13' }, 'week'],
    [{ from: '2026-05-15', to: '2026-11-13' }, 'month'],
    [{ from: '2025-01-01', to: '2026-11-13' }, 'month'],
  ] as const)('la plage %o est regroupée par %s', (range, granularity) => {
    expect(granularityForRange(range)).toBe(granularity);
  });

  it('rejette une plage inversée ou une date impossible', () => {
    expect(isValidRange({ from: '2026-11-13', to: '2026-11-01' })).toBe(false);
    expect(isValidRange({ from: '2026-02-30', to: '2026-03-01' })).toBe(false);
    expect(isValidRange({ from: '2026-11-01', to: '2026-11-13' })).toBe(true);
  });

  it('donne le jour local au format YYYY-MM-DD', () => {
    expect(todayIso({ now: new Date(2026, 0, 5, 23, 59) })).toBe('2026-01-05');
  });
});
