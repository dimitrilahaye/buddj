import { describe, expect, it } from 'vitest';
import {
  EMPTY_SELECTION,
  addMonths,
  dayStatus,
  monthGrid,
  pickDay,
  rangeFromSelection,
  selectionFromRange,
} from '../../src/application/spending-tracker/date-range-selection.js';

describe('sélection d’une période au calendrier', () => {
  it('le premier clic pose le début, le second la fin', () => {
    const afterStart = pickDay({ selection: EMPTY_SELECTION, day: '2026-11-03' });
    expect(afterStart).toEqual({ start: '2026-11-03', end: null });

    const afterEnd = pickDay({ selection: afterStart, day: '2026-11-10' });
    expect(afterEnd).toEqual({ start: '2026-11-03', end: '2026-11-10' });
    expect(rangeFromSelection(afterEnd)).toEqual({ from: '2026-11-03', to: '2026-11-10' });
  });

  it('valider sans date de fin donne ce seul jour', () => {
    const selection = pickDay({ selection: EMPTY_SELECTION, day: '2026-11-03' });
    expect(rangeFromSelection(selection)).toEqual({ from: '2026-11-03', to: '2026-11-03' });
  });

  it('rien à valider tant qu’aucun début n’est choisi', () => {
    expect(rangeFromSelection(EMPTY_SELECTION)).toBeNull();
  });

  it('un jour antérieur au début remplace le début', () => {
    const selection = pickDay({ selection: { start: '2026-11-10', end: null }, day: '2026-11-03' });
    expect(selection).toEqual({ start: '2026-11-03', end: null });
  });

  it('recliquer sur le début le garde comme jour unique', () => {
    const selection = pickDay({ selection: { start: '2026-11-10', end: null }, day: '2026-11-10' });
    expect(selection).toEqual({ start: '2026-11-10', end: null });
  });

  it('un clic après une plage complète repart d’un nouveau début', () => {
    const selection = pickDay({ selection: { start: '2026-11-03', end: '2026-11-10' }, day: '2026-11-12' });
    expect(selection).toEqual({ start: '2026-11-12', end: null });
  });

  it('reprend une plage existante, un seul jour devenant un début sans fin', () => {
    expect(selectionFromRange({ from: '2026-11-01', to: '2026-11-13' })).toEqual({
      start: '2026-11-01',
      end: '2026-11-13',
    });
    expect(selectionFromRange({ from: '2026-11-13', to: '2026-11-13' })).toEqual({
      start: '2026-11-13',
      end: null,
    });
  });

  it('situe chaque jour par rapport à la sélection', () => {
    const selection = { start: '2026-11-03', end: '2026-11-05' };
    expect(dayStatus({ selection, day: '2026-11-02' })).toBe('outside');
    expect(dayStatus({ selection, day: '2026-11-03' })).toBe('start');
    expect(dayStatus({ selection, day: '2026-11-04' })).toBe('inside');
    expect(dayStatus({ selection, day: '2026-11-05' })).toBe('end');
    expect(dayStatus({ selection: { start: '2026-11-03', end: null }, day: '2026-11-03' })).toBe('single');
  });

  it('navigue de mois en mois, à cheval sur les années', () => {
    expect(addMonths({ month: '2026-12', months: 1 })).toBe('2027-01');
    expect(addMonths({ month: '2026-01', months: -1 })).toBe('2025-12');
    expect(addMonths({ month: '2026-11', months: -11 })).toBe('2025-12');
  });

  it('découpe le mois en semaines du lundi au dimanche', () => {
    // novembre 2026 commence un dimanche et finit un lundi
    const weeks = monthGrid({ month: '2026-11' });
    expect(weeks).toHaveLength(6);
    expect(weeks[0]).toEqual([null, null, null, null, null, null, '2026-11-01']);
    expect(weeks[5]).toEqual(['2026-11-30', null, null, null, null, null, null]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });

  it('un mois qui commence un lundi ne laisse pas de semaine vide', () => {
    // février 2027 : du lundi 1er au dimanche 28
    const weeks = monthGrid({ month: '2027-02' });
    expect(weeks).toHaveLength(4);
    expect(weeks[0]![0]).toBe('2027-02-01');
    expect(weeks[3]![6]).toBe('2027-02-28');
  });
});
