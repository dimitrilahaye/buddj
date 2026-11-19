/**
 * Répartition du suivi des dépenses en anneau : par type (dépenses / sorties) ou par catégorie,
 * selon l'encart observé. SVG fait main, sans dépendance.
 *
 * Le centre donne le total ; survoler ou cibler une part (ou sa ligne de légende) y affiche
 * son montant et sa part. La légende liste chaque part avec montant et pourcentage.
 */
import type { PieSlice } from '../../application/spending-tracker/spending-pie-slices.js';
import { escapeAttr } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';
import { legendItemsHtml, percentFormatter, sliceKeyOf } from './spending-legend.js';

export type SpendingTrackerPieData = {
  title: string;
  slices: PieSlice[];
  isRefreshing: boolean;
};

const SIZE = 180;
const OUTER = 88;
const INNER = 58;
const CENTER = SIZE / 2;

/** Plusieurs anneaux peuvent coexister : chacun son identifiant de titre. */
let nextPieId = 0;


function point(radius: number, angle: number): string {
  // Angle 0 en haut, sens horaire
  return `${(CENTER + radius * Math.sin(angle)).toFixed(3)} ${(CENTER - radius * Math.cos(angle)).toFixed(3)}`;
}

/** Secteur d'anneau entre deux angles (radians). */
function arcPath(start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  return [
    `M ${point(OUTER, start)}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${point(OUTER, end)}`,
    `L ${point(INNER, end)}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${point(INNER, start)}`,
    'Z',
  ].join(' ');
}

export class BuddjSpendingTrackerPie extends HTMLElement {
  static readonly tagName = 'buddj-spending-tracker-pie';

  private _data?: SpendingTrackerPieData;
  /** Part survolée ou ciblée, null si aucune. */
  private _activeKey: string | null = null;

  connectedCallback(): void {
    if (!this.querySelector('.spending-pie')) {
      const titleId = `spending-pie-title-${++nextPieId}`;
      this.innerHTML = `
        <figure class="spending-pie" aria-labelledby="${titleId}">
          <figcaption class="spending-pie-title" id="${titleId}"></figcaption>
          <div class="spending-pie-body">
            <div class="spending-pie-plot">
              <svg class="spending-pie-svg" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true" focusable="false"></svg>
              <div class="spending-pie-center" aria-hidden="true">
                <span class="spending-pie-center-amount"></span>
                <span class="spending-pie-center-label"></span>
              </div>
            </div>
            <ul class="spending-pie-legend" aria-label="Parts"></ul>
          </div>
        </figure>
      `;
    }
    this.addEventListener('pointerover', this._onPointerOver);
    this.addEventListener('pointerleave', this._onLeave);
    this.addEventListener('focusin', this._onFocusIn);
    this.addEventListener('focusout', this._onLeave);
    this._draw();
  }

  disconnectedCallback(): void {
    this.removeEventListener('pointerover', this._onPointerOver);
    this.removeEventListener('pointerleave', this._onLeave);
    this.removeEventListener('focusin', this._onFocusIn);
    this.removeEventListener('focusout', this._onLeave);
  }

  render(data: SpendingTrackerPieData): void {
    this._data = data;
    if (this._activeKey && !data.slices.some((s) => s.key === this._activeKey)) this._activeKey = null;
    this._draw();
  }

  private _activate(key: string | null): void {
    if (key === this._activeKey) return;
    this._activeKey = key;
    this._syncActive();
  }

  private _onPointerOver = (e: Event): void => {
    this._activate(sliceKeyOf(e.target));
  };

  private _onFocusIn = (e: Event): void => {
    this._activate(sliceKeyOf(e.target));
  };

  private _onLeave = (): void => {
    this._activate(null);
  };

  private _draw(): void {
    const data = this._data;
    if (!data || !this.querySelector('.spending-pie')) return;
    (this.querySelector('.spending-pie-title') as HTMLElement).textContent = data.title;
    this.querySelector('.spending-pie-plot')?.classList.toggle('spending-pie-plot--refreshing', data.isRefreshing);

    const svg = this.querySelector('.spending-pie-svg') as SVGSVGElement;
    let angle = 0;
    svg.innerHTML = data.slices
      .map((slice) => {
        const start = angle;
        angle += slice.share * 2 * Math.PI;
        // Une part qui fait tout l'anneau : un arc de 360° ne se trace pas, on pose deux cercles.
        const shape =
          slice.share >= 0.9999
            ? `<path class="spending-pie-slice" fill-rule="evenodd" d="M ${CENTER - OUTER} ${CENTER} a ${OUTER} ${OUTER} 0 1 0 ${2 * OUTER} 0 a ${OUTER} ${OUTER} 0 1 0 ${-2 * OUTER} 0 M ${CENTER - INNER} ${CENTER} a ${INNER} ${INNER} 0 1 0 ${2 * INNER} 0 a ${INNER} ${INNER} 0 1 0 ${-2 * INNER} 0"`
            : `<path class="spending-pie-slice" d="${arcPath(start, angle)}"`;
        return `${shape} data-slice="${escapeAttr(slice.key)}" style="fill:${escapeAttr(slice.color)}"></path>`;
      })
      .join('');

    (this.querySelector('.spending-pie-legend') as HTMLElement).innerHTML = legendItemsHtml(data.slices);
    this._syncActive();
  }

  /** Met la part active en avant et l'affiche au centre ; sans part active, le centre donne le total. */
  private _syncActive(): void {
    const data = this._data;
    if (!data) return;
    const active = data.slices.find((s) => s.key === this._activeKey) ?? null;
    this.querySelector('.spending-pie-svg')?.classList.toggle('spending-pie-svg--focused', active !== null);
    this.querySelectorAll<HTMLElement | SVGElement>('[data-slice]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.slice === this._activeKey);
    });
    const total = data.slices.reduce((sum, s) => sum + s.amount, 0);
    (this.querySelector('.spending-pie-center-amount') as HTMLElement).textContent = formatEuros(active ? active.amount : total);
    (this.querySelector('.spending-pie-center-label') as HTMLElement).textContent = active
      ? `${active.label} · ${percentFormatter.format(active.share)}`
      : 'Total';
  }
}

customElements.define(BuddjSpendingTrackerPie.tagName, BuddjSpendingTrackerPie);
