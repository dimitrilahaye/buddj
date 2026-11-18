/**
 * Tableau de bord du suivi des dépenses : totaux, moyennes par jour / semaine / mois
 * et répartition par catégorie (emoji de tête du libellé), sur la vue déjà filtrée par type.
 */
import { categoryOfLabel, EMOJI_CATEGORIES, UNCATEGORIZED } from '../../shared/emoji-categories.js';
import { daysInRange } from './spending-tracker-range.js';
import type { SpendingTrackerView, TrackedSpendingEntry } from './spending-tracker-types.js';

export type AverageUnit = 'day' | 'week' | 'month';

/** Nombre moyen de jours dans un mois. */
const DAYS_PER_MONTH = 365.25 / 12;

const UNIT_DAYS: Record<AverageUnit, number> = { day: 1, week: 7, month: DAYS_PER_MONTH };

export type SpendingAmounts = { total: number; expensesTotal: number; outflowsTotal: number };

export type SpendingAverage = { unit: AverageUnit } & SpendingAmounts;

export type SpendingCategoryStats = SpendingAmounts & {
  id: string;
  title: string;
  emoji: string;
  /** Part du total de la période, entre 0 et 1 */
  share: number;
  averages: SpendingAverage[];
};

export type SpendingDashboard = {
  /** Jours écoulés de la période (jusqu'à aujourd'hui inclus) qui servent aux moyennes */
  elapsedDays: number;
  /** Unités pertinentes : la période écoulée en couvre plus d'une */
  units: AverageUnit[];
  totals: SpendingAmounts;
  averages: SpendingAverage[];
  /** Catégories ayant des dépenses, de la plus coûteuse à la moins coûteuse */
  categories: SpendingCategoryStats[];
};

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Jours de la période déjà écoulés : une plage qui déborde sur le futur s'arrête à aujourd'hui. */
export function elapsedDays({ from, to, today }: { from: string; to: string; today: string }): number {
  if (from > today) return 0;
  return daysInRange({ from, to: to < today ? to : today });
}

/** Une moyenne par unité n'a de sens que si la période en couvre plus d'une. */
export function averageUnits({ days }: { days: number }): AverageUnit[] {
  return (['day', 'week', 'month'] as const).filter((unit) => days > UNIT_DAYS[unit]);
}

function averagesOf({ amounts, days, units }: { amounts: SpendingAmounts; days: number; units: AverageUnit[] }): SpendingAverage[] {
  return units.map((unit) => {
    const periods = days / UNIT_DAYS[unit];
    return {
      unit,
      total: roundCents(amounts.total / periods),
      expensesTotal: roundCents(amounts.expensesTotal / periods),
      outflowsTotal: roundCents(amounts.outflowsTotal / periods),
    };
  });
}

function amountsOf(entries: TrackedSpendingEntry[]): SpendingAmounts {
  let expensesTotal = 0;
  let outflowsTotal = 0;
  for (const entry of entries) {
    if (entry.kind === 'expense') expensesTotal += entry.amount;
    else outflowsTotal += entry.amount;
  }
  return {
    total: roundCents(expensesTotal + outflowsTotal),
    expensesTotal: roundCents(expensesTotal),
    outflowsTotal: roundCents(outflowsTotal),
  };
}

/** Ordre d'affichage stable des catégories à montant égal : celui du drawer, « sans catégorie » en dernier. */
const CATEGORY_ORDER = new Map([...EMOJI_CATEGORIES, UNCATEGORIZED].map((c, i) => [c.id, i]));

export function spendingDashboard({ view, today }: { view: SpendingTrackerView; today: string }): SpendingDashboard {
  const days = elapsedDays({ from: view.from, to: view.to, today });
  const units = averageUnits({ days });
  const totals: SpendingAmounts = {
    total: view.total,
    expensesTotal: view.expensesTotal,
    outflowsTotal: view.outflowsTotal,
  };

  const entriesByCategory = new Map<string, TrackedSpendingEntry[]>();
  for (const entry of view.buckets.flatMap((b) => b.entries)) {
    const { id } = categoryOfLabel(entry.label);
    entriesByCategory.set(id, [...(entriesByCategory.get(id) ?? []), entry]);
  }
  const categories = [...EMOJI_CATEGORIES, UNCATEGORIZED]
    .filter((category) => entriesByCategory.has(category.id))
    .map((category): SpendingCategoryStats => {
      const amounts = amountsOf(entriesByCategory.get(category.id) ?? []);
      return {
        id: category.id,
        title: category.title,
        emoji: category.emojis[0] ?? '',
        ...amounts,
        share: totals.total > 0 ? amounts.total / totals.total : 0,
        averages: averagesOf({ amounts, days, units }),
      };
    })
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total || CATEGORY_ORDER.get(a.id)! - CATEGORY_ORDER.get(b.id)!);

  return {
    elapsedDays: days,
    units,
    totals,
    averages: averagesOf({ amounts: totals, days, units }),
    categories,
  };
}
