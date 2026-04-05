/**
 * Modèle partagé pour les objectifs (économies / remboursements).
 * totalGoal = somme à atteindre ; additions = historique des ajouts ; currentIndex = position dans l’historique (back/forward).
 */

/** Emoji proposé par défaut à l’ajout d’une économie (objectif d’épargne). */
export const DEFAULT_GOAL_EMOJI_SAVINGS = '🐖';

/** Emoji proposé par défaut à l’ajout d’un remboursement. */
export const DEFAULT_GOAL_EMOJI_REIMBURSEMENT = '💸';

export interface GoalItem {
  id: string;
  label: string;
  icon: string;
  totalGoal: number;
  additions: number[];
  currentIndex: number;
}

export function getAddedAmount(item: GoalItem): number {
  if (item.additions.length === 0) return 0;
  const end = Math.min(item.currentIndex + 1, item.additions.length);
  return item.additions.slice(0, end).reduce((s, a) => s + a, 0);
}

export function getRemaining(item: GoalItem): number {
  return Math.max(0, item.totalGoal - getAddedAmount(item));
}

export function canGoBack(item: GoalItem): boolean {
  return item.currentIndex >= 0;
}

export function canGoForward(item: GoalItem): boolean {
  return item.additions.length > 0 && item.currentIndex < item.additions.length - 1;
}

export function formatEuros(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' €';
}

/** Parse une chaîne type "1 240,00 €" ou "320.50" en nombre. */
export function parseEurosToNumber(s: string): number {
  const cleaned = s.replace(/\s/g, '').replace('€', '').replace(/restant.*/gi, '').trim().replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}
