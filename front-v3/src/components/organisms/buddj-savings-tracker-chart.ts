/**
 * Courbe du suivi des épargnes : le solde sur la période, qui monte avec les ajouts et
 * descend avec les retraits. Un point vert ou orange marque chaque période où l'argent
 * est entré ou sorti. SVG fait main, sans dépendance, sur le modèle de la courbe cumulée
 * du suivi des dépenses (réticule, infobulle, flèches gauche/droite au clavier).
 */
import { niceAxisTicks } from '../../application/spending-tracker/spending-tracker-cumulative.js';
import { savingsValueDomain, type SavingsChartPoint } from '../../application/savings-account/savings-tracker-series.js';
import type { SpendingGranularity } from '../../application/spending-tracker/spending-tracker-types.js';
import { formatEuros } from '../../shared/goal.js';
import { formatBucketAxisLabel, formatBucketLabel } from '../../shared/spending-bucket-label.js';

export type SavingsTrackerChartData = {
  points: SavingsChartPoint[];
  granularity: SpendingGranularity;
  isRefreshing: boolean;
};

const HEIGHT = 220;
const PAD = { top: 20, right: 16, bottom: 26, left: 56 };
const FALLBACK_WIDTH = 340;
const SVG_NS = 'http://www.w3.org/2000/svg';
const BALANCE_COLOR = 'var(--series-savings-balance)';
const DEPOSIT_COLOR = 'var(--series-savings-deposit)';
const WITHDRAWAL_COLOR = 'var(--series-savings-withdrawal)';

function compactEuros(value: number): string {
  if (Math.abs(value) >= 10_000) return `${Math.round(value / 1000)} k€`;
  return `${Math.round(value)} €`;
}

/** Graduations « rondes » couvrant [min, max]. */
function axisTicks({ min, max }: { min: number; max: number }): number[] {
  const span = max - min;
  if (span <= 0) return [min];
  const [, step = span] = niceAxisTicks({ max: span });
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value < max + step; value += step) {
    ticks.push(Math.round(value * 100) / 100);
    if (value >= max) break;
  }
  return ticks;
}

/** Couleur du point de mouvement d'un bucket, ou null s'il ne s'est rien passé. */
function movementColor(point: SavingsChartPoint): string | null {
  if (point.deposits === 0 && point.withdrawals === 0) return null;
  return point.deposits - point.withdrawals < 0 ? WITHDRAWAL_COLOR : DEPOSIT_COLOR;
}

export class BuddjSavingsTrackerChart extends HTMLElement {
  static readonly tagName = 'buddj-savings-tracker-chart';

  private _data?: SavingsTrackerChartData;
  private _activeIndex: number | null = null;
  private _xs: number[] = [];
  private _resizeObserver?: ResizeObserver;
  private _lastWidth = 0;

  connectedCallback(): void {
    if (!this.querySelector('.spending-chart')) {
      this.innerHTML = `
        <figure class="spending-chart savings-chart">
          <figcaption class="spending-chart-caption">
            <span class="spending-chart-title">Évolution du solde</span>
            <span class="savings-chart-balance">
              <span class="spending-chart-swatch" style="background:${BALANCE_COLOR}" aria-hidden="true"></span>
              <span class="savings-chart-balance-label">Solde</span>
              <strong class="savings-chart-balance-value"></strong>
            </span>
          </figcaption>
          <div class="spending-chart-plot" tabindex="0" role="group">
            <svg class="spending-chart-svg" aria-hidden="true" focusable="false"></svg>
            <div class="spending-chart-tooltip" role="status" aria-label="Valeurs de la période survolée" hidden></div>
          </div>
        </figure>
      `;
    }
    const plot = this._plot();
    plot.addEventListener('pointermove', this._onPointerMove);
    plot.addEventListener('pointerleave', this._onPointerLeave);
    plot.addEventListener('click', this._onPlotClick);
    plot.addEventListener('keydown', this._onKeyDown);
    plot.addEventListener('blur', this._onPointerLeave);
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => {
        if (this._plot().clientWidth !== this._lastWidth) this._draw();
      });
      this._resizeObserver.observe(plot);
    }
    this._draw();
  }

  disconnectedCallback(): void {
    const plot = this.querySelector<HTMLElement>('.spending-chart-plot');
    plot?.removeEventListener('pointermove', this._onPointerMove);
    plot?.removeEventListener('pointerleave', this._onPointerLeave);
    plot?.removeEventListener('click', this._onPlotClick);
    plot?.removeEventListener('keydown', this._onKeyDown);
    plot?.removeEventListener('blur', this._onPointerLeave);
    this._resizeObserver?.disconnect();
  }

  render(data: SavingsTrackerChartData): void {
    this._data = data;
    if (this._activeIndex !== null && this._activeIndex >= data.points.length) this._activeIndex = null;
    this._draw();
  }

  private _plot(): HTMLElement {
    return this.querySelector('.spending-chart-plot') as HTMLElement;
  }

  private _draw(): void {
    const data = this._data;
    if (!data || !this.querySelector('.spending-chart')) return;
    const plot = this._plot();
    const svg = this.querySelector('svg') as SVGSVGElement;
    const width = plot.clientWidth || FALLBACK_WIDTH;
    this._lastWidth = plot.clientWidth;
    const { points, granularity } = data;

    plot.classList.toggle('spending-chart-plot--refreshing', data.isRefreshing);

    const last = points.at(-1);
    (this.querySelector('.savings-chart-balance-value') as HTMLElement).textContent = formatEuros(last?.balance ?? 0);
    plot.setAttribute(
      'aria-label',
      last
        ? `Solde : ${formatEuros(last.balance)} au ${formatBucketLabel({ start: last.key, granularity })}. Flèches gauche et droite pour parcourir.`
        : 'Aucune donnée'
    );

    const ticks = axisTicks(savingsValueDomain({ points }));
    const yMin = ticks[0] ?? 0;
    const yMax = ticks.at(-1) ?? 1;
    const ySpan = yMax - yMin || 1;
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number): number =>
      points.length <= 1 ? PAD.left + innerW / 2 : PAD.left + (i / (points.length - 1)) * innerW;
    const y = (value: number): number => PAD.top + innerH - ((value - yMin) / ySpan) * innerH;
    this._xs = points.map((_, i) => x(i));

    svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(HEIGHT));
    svg.replaceChildren();

    const add = <K extends keyof SVGElementTagNameMap>(
      tag: K,
      attrs: Record<string, string | number>
    ): SVGElementTagNameMap[K] => {
      const el = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      svg.appendChild(el);
      return el;
    };

    for (const tick of ticks) {
      add('line', {
        class: tick === 0 ? 'spending-chart-grid savings-chart-zero' : 'spending-chart-grid',
        x1: PAD.left,
        x2: width - PAD.right,
        y1: y(tick),
        y2: y(tick),
      });
      const label = add('text', { class: 'spending-chart-tick', x: PAD.left - 8, y: y(tick) + 4, 'text-anchor': 'end' });
      label.textContent = compactEuros(tick);
    }

    if (points.length > 0) {
      const indexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
      for (const i of indexes) {
        const anchor = points.length === 1 ? 'middle' : i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
        const label = add('text', { class: 'spending-chart-tick', x: x(i), y: HEIGHT - 6, 'text-anchor': anchor });
        label.textContent = formatBucketAxisLabel({ start: points[i]!.key, granularity });
      }
    }

    if (points.length === 0) return;

    if (points.length > 1) {
      add('polyline', {
        class: 'spending-chart-line savings-chart-line',
        style: `stroke: ${BALANCE_COLOR}`,
        points: points.map((p, i) => `${x(i)},${y(p.balance)}`).join(' '),
      });
    }
    points.forEach((p, i) => {
      const color = movementColor(p);
      if (color) add('circle', { class: 'savings-chart-movement', style: `fill: ${color}`, cx: x(i), cy: y(p.balance), r: 3 });
    });
    const lastIndex = points.length - 1;
    add('circle', {
      class: 'spending-chart-dot',
      style: `fill: ${BALANCE_COLOR}`,
      cx: x(lastIndex),
      cy: y(points[lastIndex]!.balance),
      r: 3.5,
    });

    if (this._activeIndex !== null) {
      const i = this._activeIndex;
      add('line', { class: 'spending-chart-crosshair', x1: x(i), x2: x(i), y1: PAD.top, y2: PAD.top + innerH });
      add('circle', { class: 'spending-chart-dot', style: `fill: ${BALANCE_COLOR}`, cx: x(i), cy: y(points[i]!.balance), r: 4 });
    }
    this._renderTooltip();
  }

  private _renderTooltip(): void {
    const tooltip = this.querySelector('.spending-chart-tooltip') as HTMLElement;
    const data = this._data;
    const i = this._activeIndex;
    const p = i === null ? undefined : data?.points[i];
    if (!data || i === null || !p) {
      tooltip.hidden = true;
      tooltip.replaceChildren();
      return;
    }
    tooltip.replaceChildren();
    const title = document.createElement('p');
    title.className = 'spending-chart-tooltip-title';
    title.textContent = formatBucketLabel({ start: p.key, granularity: data.granularity });
    tooltip.appendChild(title);

    const rows: Array<{ color: string; value: string; label: string }> = [
      { color: BALANCE_COLOR, value: formatEuros(p.balance), label: 'de solde' },
    ];
    if (p.deposits > 0) rows.push({ color: DEPOSIT_COLOR, value: `+ ${formatEuros(p.deposits)}`, label: 'ajoutés' });
    if (p.withdrawals > 0) rows.push({ color: WITHDRAWAL_COLOR, value: `− ${formatEuros(p.withdrawals)}`, label: 'retirés' });
    for (const { color, value, label } of rows) {
      const row = document.createElement('p');
      row.className = 'spending-chart-tooltip-row';
      const swatch = document.createElement('span');
      swatch.className = 'spending-chart-tooltip-key';
      swatch.style.background = color;
      swatch.setAttribute('aria-hidden', 'true');
      const strong = document.createElement('strong');
      strong.textContent = value;
      row.append(swatch, strong, document.createTextNode(` ${label}`));
      tooltip.appendChild(row);
    }
    tooltip.hidden = false;
    const xPos = this._xs[i] ?? 0;
    const width = this._plot().clientWidth || FALLBACK_WIDTH;
    tooltip.classList.toggle('spending-chart-tooltip--left', xPos > width / 2);
    tooltip.style.setProperty('--x', `${xPos}px`);
  }

  private _nearestIndex(clientX: number): number | null {
    if (this._xs.length === 0) return null;
    const localX = clientX - this._plot().getBoundingClientRect().left;
    let best = 0;
    this._xs.forEach((xi, i) => {
      if (Math.abs(xi - localX) < Math.abs(this._xs[best]! - localX)) best = i;
    });
    return best;
  }

  private _setActive(index: number | null): void {
    if (index === this._activeIndex) return;
    this._activeIndex = index;
    this._draw();
  }

  private _onPointerMove = (e: PointerEvent): void => {
    this._setActive(this._nearestIndex(e.clientX));
  };

  private _onPointerLeave = (): void => {
    this._setActive(null);
  };

  private _onPlotClick = (e: MouseEvent): void => {
    this._setActive(this._nearestIndex(e.clientX));
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    const count = this._data?.points.length ?? 0;
    if (count === 0) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this._setActive(this._activeIndex === null ? count - 1 : Math.max(0, this._activeIndex - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this._setActive(this._activeIndex === null ? count - 1 : Math.min(count - 1, this._activeIndex + 1));
    } else if (e.key === 'Escape') {
      this._setActive(null);
    }
  };
}

customElements.define(BuddjSavingsTrackerChart.tagName, BuddjSavingsTrackerChart);
