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
 * Normalise un montant pour la recherche : minuscules, sans espaces ni symbole €.
 */
export function normalizeAmountForSearch(amount: string): string {
  return (amount ?? '')
    .toLowerCase()
    .replace(/\s/g, '')
    .replace('€', '');
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
  const amountNorm = normalizeAmountForSearch(amount);
  const amountMatch = amountNorm.includes(nQuery);
  return labelMatch || amountMatch;
}
