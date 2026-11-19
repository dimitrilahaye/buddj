/**
 * Parts du graphique en secteurs : le cumul final de chaque série de la courbe,
 * pour garder les mêmes regroupements et les mêmes couleurs d'un graphique à l'autre.
 */
import { OTHER_CATEGORIES_KEY, type ChartStack } from './spending-chart-series.js';

export type PieSlice = {
  key: string;
  label: string;
  color: string;
  amount: number;
  /** Part du total, entre 0 et 1 */
  share: number;
};

/** Parts non nulles, de la plus grande à la plus petite (« Autres catégories » reste en dernier). */
export function pieSlices({ series, points }: ChartStack): PieSlice[] {
  const last = points.at(-1);
  if (!last || last.total <= 0) return [];
  const slices = series
    .map((s) => ({ key: s.key, label: s.label, color: s.color, amount: last.values[s.key] ?? 0 }))
    .filter((s) => s.amount > 0);
  const total = slices.reduce((sum, s) => sum + s.amount, 0);
  const isOther = (key: string): boolean => key === OTHER_CATEGORIES_KEY;
  return slices
    .sort((a, b) => Number(isOther(a.key)) - Number(isOther(b.key)) || b.amount - a.amount)
    .map((s) => ({ ...s, share: s.amount / total }));
}
