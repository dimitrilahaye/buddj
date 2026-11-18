/**
 * Séries empilées de la courbe cumulée : par type (dépenses / sorties) pour l'encart « Total »,
 * par catégorie pour l'encart « Par catégorie ».
 */
import { categoryOfLabel } from '../../shared/emoji-categories.js';
import type { CumulativePoint } from './spending-tracker-cumulative.js';
import { todayIso } from './spending-tracker-range.js';
import type { SpendingBucket, SpendingKindsFilter, SpendingTrackerView, TrackedSpendingEntry } from './spending-tracker-types.js';

export type ChartSeries = {
  key: string;
  label: string;
  /** Valeur CSS de couleur (variable ou hex) */
  color: string;
};

export type StackPoint = {
  /** Premier jour du bucket (YYYY-MM-DD), ou l'heure (« 0 » à « 23 ») en pas horaire */
  key: string;
  /** Montant dépensé dans ce bucket seul */
  bucketTotal: number;
  /** Cumul total depuis le début de la période */
  total: number;
  /** Cumul de chaque série, par clé de série */
  values: Record<string, number>;
};

export type ChartStack = {
  /** Séries de bas en haut de la pile */
  series: ChartSeries[];
  points: StackPoint[];
};

/** Catégories tracées une à une ; les suivantes sont regroupées. */
export const MAX_CATEGORY_SERIES = 5;

/** Palette catégorielle validée sur la surface sombre (ordre fixe, jamais cyclé). */
export const CATEGORY_SERIES_COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181'];
const OTHER_CATEGORIES_COLOR = '#7d8090';
const OTHER_CATEGORIES_KEY = 'other';

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Sorties en bas, dépenses au-dessus, selon les types affichés. */
export function kindStack({ points, kinds }: { points: CumulativePoint[]; kinds: SpendingKindsFilter }): ChartStack {
  const series: ChartSeries[] = [];
  if (kinds.outflow) series.push({ key: 'outflow', label: 'Sorties', color: 'var(--series-outflow)' });
  if (kinds.expense) series.push({ key: 'expense', label: 'Dépenses', color: 'var(--series-expense)' });
  return {
    series,
    points: points.map((p) => ({
      key: p.key,
      bucketTotal: p.bucketTotal,
      total: p.total,
      values: { outflow: p.outflows, expense: p.expenses },
    })),
  };
}

type EntryGroup = { key: string; entries: TrackedSpendingEntry[] };

/** Une plage d'un seul jour se lit heure par heure, jusqu'à l'heure actuelle si c'est aujourd'hui. */
function hourlyGroups({ bucket, now }: { bucket: SpendingBucket; now: Date }): EntryGroup[] {
  const lastHour = bucket.start === todayIso({ now }) ? now.getHours() : 23;
  const groups = Array.from({ length: lastHour + 1 }, (_, hour): EntryGroup => ({ key: String(hour), entries: [] }));
  for (const entry of bucket.entries) {
    groups[Math.min(new Date(entry.occurredAt).getHours(), lastHour)]!.entries.push(entry);
  }
  return groups;
}

/**
 * Cumul par catégorie : les plus coûteuses de la période en bas de la pile,
 * au-delà de MAX_CATEGORY_SERIES regroupées dans « Autres catégories ».
 */
export function categoryStack({
  view,
  hourly = false,
  now = new Date(),
}: {
  view: SpendingTrackerView;
  hourly?: boolean;
  now?: Date;
}): ChartStack {
  const [singleDay] = view.buckets;
  const groups: EntryGroup[] =
    hourly && singleDay
      ? hourlyGroups({ bucket: singleDay, now })
      : view.buckets.map((bucket) => ({ key: bucket.start, entries: bucket.entries }));

  const totalsByCategory = new Map<string, { title: string; total: number }>();
  for (const entry of groups.flatMap((g) => g.entries)) {
    const category = categoryOfLabel(entry.label);
    const current = totalsByCategory.get(category.id) ?? { title: category.title, total: 0 };
    current.total += entry.amount;
    totalsByCategory.set(category.id, current);
  }
  const ranked = [...totalsByCategory.entries()].sort(([, a], [, b]) => b.total - a.total);
  // Une seule catégorie de trop ne vaut pas un regroupement : on la trace.
  const shown = ranked.length > MAX_CATEGORY_SERIES + 1 ? ranked.slice(0, MAX_CATEGORY_SERIES) : ranked;
  const shownIds = new Set(shown.map(([id]) => id));
  const series: ChartSeries[] = shown.map(([id, { title }], index) => ({
    key: id,
    label: title,
    color: CATEGORY_SERIES_COLORS[index] ?? OTHER_CATEGORIES_COLOR,
  }));
  if (shown.length < ranked.length) {
    series.push({ key: OTHER_CATEGORIES_KEY, label: 'Autres catégories', color: OTHER_CATEGORIES_COLOR });
  }

  const cumulative: Record<string, number> = Object.fromEntries(series.map((s) => [s.key, 0]));
  let total = 0;
  const points = groups.map((group): StackPoint => {
    let bucketTotal = 0;
    for (const entry of group.entries) {
      const { id } = categoryOfLabel(entry.label);
      const key = shownIds.has(id) ? id : OTHER_CATEGORIES_KEY;
      cumulative[key] = roundCents((cumulative[key] ?? 0) + entry.amount);
      bucketTotal += entry.amount;
    }
    total = roundCents(total + bucketTotal);
    return { key: group.key, bucketTotal: roundCents(bucketTotal), total, values: { ...cumulative } };
  });
  return { series, points };
}
