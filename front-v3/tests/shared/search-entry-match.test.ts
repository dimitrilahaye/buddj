import { describe, it, expect } from 'vitest';
import { entryMatchesSearch } from '../../src/shared/search.js';

describe('entryMatchesSearch (montant partiel / séparateurs)', () => {
  it('trouve 10,50€ quand on tape 10. ou 10, (préfixe décimal)', () => {
    expect(entryMatchesSearch('Loyer', '10.5', '10.')).toBe(true);
    expect(entryMatchesSearch('Loyer', '10.5', '10,')).toBe(true);
    expect(entryMatchesSearch('Loyer', '10.5', '10.5')).toBe(true);
    expect(entryMatchesSearch('Loyer', '10.5', '10,5')).toBe(true);
  });

  it('accepte le montant stocké avec virgule', () => {
    expect(entryMatchesSearch('', '10,5', '10.')).toBe(true);
    expect(entryMatchesSearch('', '10,5', '10,50')).toBe(true);
  });

  it('trouve par libellé comme avant', () => {
    expect(entryMatchesSearch('Kebab', '15', 'keb')).toBe(true);
    expect(entryMatchesSearch('Kebab', '15', '15')).toBe(true);
  });

  it('ne matche pas un montant avec seulement . ou , sans chiffre', () => {
    expect(entryMatchesSearch('Loyer', '10.5', '.')).toBe(false);
    expect(entryMatchesSearch('Loyer', '10.5', ',')).toBe(false);
  });
});
