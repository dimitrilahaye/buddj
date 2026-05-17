/** Attributs DOM partagés pour la simulation d’inclusion dans un total projeté. */
export const PROJECTED_SIMULATION_INCLUDE_ATTR = 'data-projected-simulation-include';
export const PROJECTED_SIMULATION_ROW_ID_ATTR = 'data-projected-simulation-row-id';

export type ProjectedSimulationKind = 'charge' | 'budget';

export function projectedSimulationKey({
  kind,
  id,
}: {
  kind: ProjectedSimulationKind;
  id: string;
}): string {
  return `${kind}:${id}`;
}

export function sumIncludedAmounts<T>({
  items,
  getAmount,
  isIncluded,
}: {
  items: T[];
  getAmount: (item: T) => number;
  isIncluded: (item: T) => boolean;
}): number {
  return items.reduce((sum, item) => (isIncluded(item) ? sum + getAmount(item) : sum), 0);
}

export function isProjectedSimulationActive({
  inclusionByKey,
}: {
  inclusionByKey: Map<string, boolean>;
}): boolean {
  for (const included of inclusionByKey.values()) {
    if (!included) return true;
  }
  return false;
}

/** Icône reload pour le bouton « Terminer la simulation » (accessibilité via aria-label sur le bouton). */
export const PROJECTED_SIMULATION_RESET_ICON_SVG = `<svg class="projected-simulation-end__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
