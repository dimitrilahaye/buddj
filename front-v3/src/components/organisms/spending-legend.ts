/**
 * Légende commune aux graphiques du suivi des dépenses (courbe cumulée, répartition en anneau) :
 * une ligne par série avec pastille, nom, montant et part du total. Survoler ou cibler une ligne
 * met sa série en avant dans le graphique (`data-slice`).
 */
import type { PieSlice } from '../../application/spending-tracker/spending-pie-slices.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

export const percentFormatter = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });

export function legendItemsHtml(slices: PieSlice[]): string {
  return slices
    .map(
      (s) => `
        <li class="spending-pie-legend-item" tabindex="0" data-slice="${escapeAttr(s.key)}"
          aria-label="${escapeAttr(`${s.label} : ${formatEuros(s.amount)}, ${percentFormatter.format(s.share)}`)}">
          <span class="spending-chart-swatch" style="background:${escapeAttr(s.color)}" aria-hidden="true"></span>
          <span class="spending-pie-legend-label">${escapeHtml(s.label)}</span>
          <span class="spending-pie-legend-amount">${escapeHtml(formatEuros(s.amount))}</span>
          <span class="spending-pie-legend-share">${escapeHtml(percentFormatter.format(s.share))}</span>
        </li>`
    )
    .join('');
}

/** Série visée par un survol ou un focus : celle de l'élément `data-slice` le plus proche, sinon aucune. */
export function sliceKeyOf(target: EventTarget | null): string | null {
  return target instanceof Element ? (target.closest<HTMLElement | SVGElement>('[data-slice]')?.dataset.slice ?? null) : null;
}
