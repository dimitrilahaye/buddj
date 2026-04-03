/**
 * Utilitaires de recherche normalisée (insensible aux accents, casse, espaces).
 * Utilisés par les drawers de recherche et les écrans qui filtrent par intitulé/montant.
 */

/**
 * Normalise une chaîne pour la recherche : minuscules, sans accents ni diacritiques.
 * Ex. "Noël" → "noel", "Été" → "ete"
 */
export function normalizeForSearch(text: string): string {
  const trimmed = (text ?? '').trim();
  if (trimmed === '') return '';
  return trimmed
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Normalise un montant pour la recherche : minuscules, sans espaces ni symbole €, virgule décimale → point.
 */
export function normalizeAmountForSearch(amount: string): string {
  return (amount ?? '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace('€', '')
    .replace(',', '.');
}

/**
 * Normalise la saisie utilisateur quand on la compare à un montant (symétrique à {@link normalizeAmountForSearch}).
 */
export function normalizeQueryForAmountMatch(query: string): string {
  return (query ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s/g, '')
    .replace('€', '')
    .replace(',', '.');
}

/** Représentations textuelles d’un montant pour « contient » (ex. 10,5 ↔ 10.50). */
function amountSearchVariants(amountStr: string): string[] {
  const norm = normalizeAmountForSearch(amountStr);
  const set = new Set<string>();
  if (norm !== '') set.add(norm);
  const n = parseFloat(norm);
  if (Number.isFinite(n)) {
    set.add(String(n));
    const f2 = n.toFixed(2);
    set.add(f2);
    set.add(f2.replace('.', ','));
  }
  return [...set];
}

/**
 * Indique si une chaîne correspond à une requête (après normalisation).
 * Utilisé pour filtrer par label, description, etc.
 */
export function textMatchesQuery(text: string, query: string): boolean {
  const nQuery = normalizeForSearch(query);
  if (nQuery === '') return true;
  return normalizeForSearch(text).includes(nQuery);
}

/**
 * Indique si un item (label + montant) correspond à une requête.
 */
export function entryMatchesSearch(
  label: string,
  amount: string,
  query: string
): boolean {
  const nQuery = normalizeForSearch(query);
  if (nQuery === '') return true;
  const labelMatch = textMatchesQuery(label, query);
  const qAmount = normalizeQueryForAmountMatch(query);
  const amountMatch =
    /\d/.test(qAmount) && amountSearchVariants(amount).some((v) => v.includes(qAmount));
  return labelMatch || amountMatch;
}
