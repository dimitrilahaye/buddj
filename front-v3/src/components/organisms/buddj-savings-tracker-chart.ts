/**
 * Courbes du suivi des épargnes : solde, ajouts cumulés et retraits cumulés sur la période.
 * SVG fait main, sans dépendance, sur le modèle de la courbe cumulée du suivi des dépenses
 * (réticule, infobulle, flèches gauche/droite au clavier).
 *
 * Légende commune au suivi des dépenses : survoler, cibler ou toucher une ligne de légende
 * (ou une courbe) met cette courbe en avant et estompe les deux autres.
 */
import { niceAxisTicks } from '../../application/spending-tracker/spending-tracker-cumulative.js';
import {
  savingsValueDomain,
  type SavingsChartPoint,
  type SavingsChartSeries,
} from '../../application/savings-account/savings-tracker-series.js';
import type { SpendingGranularity } from '../../application/spending-tracker/spending-tracker-types.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';
import { formatBucketAxisLabel, formatBucketLabel } from '../../shared/spending-bucket-label.js';
import { sliceKeyOf } from './spending-legend.js';

export type SavingsTrackerChartData = {
  series: SavingsChartSeries[];
  points: SavingsChartPoint[];
  granularity: SpendingGranularity;
  isRefreshing: boolean;
};

const HEIGHT = 220;
const PAD = { top: 20, right: 16, bottom: 26, left: 56 };
const FALLBACK_WIDTH = 340;
const SVG_NS = 'http://www.w3.org/2000/svg';

function compactEuros(value: number): string {
  if (Math.abs(value) >= 10_000) return `${Math.round(value / 1000)} k€`;
  return `${Math.round(value)} €`;
}

/** Graduations « rondes » couvrant [min, max], 0 compris. */
function axisTicks({ min, max }: { min: number; max: number }): number[] {
  const span = max - min;
  if (span <= 0) return [0];
  const [, step = span] = niceAxisTicks({ max: span });
  const start = Math.floor(min / step) * step;
  const ticks: number[] = [];
  for (let value = start; value < max + step; value += step) {
    ticks.push(Math.round(value * 100) / 100);
    if (value >= max) break;
  }
  return ticks;
}

export class BuddjSavingsTrackerChart extends HTMLElement {
  static readonly tagName = 'buddj-savings-tracker-chart';

  private _data?: SavingsTrackerChartData;
  private _activeIndex: number | null = null;
  private _xs: number[] = [];
  private _resizeObserver?: ResizeObserver;
  private _lastWidth = 0;
  /** Courbe mise en avant par survol ou focus */
  private _hoveredSeries: string | null = null;
  /** Courbe mise en avant par un clic sur la légende (reste tant qu'on ne reclique pas) */
  private _pinnedSeries: string | null = null;

  connectedCallback(): void {
    if (!this.querySelector('.spending-chart')) {
      this.innerHTML = `
        <figure class="spending-chart savings-chart">
          <figcaption class="spending-chart-caption">
            <span class="spending-chart-title">Évolution sur la période</span>
          </figcaption>
          <div class="spending-chart-plot" tabindex="0" role="group">
            <svg class="spending-chart-svg" aria-hidden="true" focusable="false"></svg>
            <div class="spending-chart-tooltip" role="status" aria-label="Valeurs de la période survolée" hidden></div>
          </div>
          <ul class="spending-pie-legend spending-chart-legend" aria-label="Courbes"></ul>
        </figure>
      `;
    }
    const plot = this._plot();
    plot.addEventListener('pointermove', this._onPointerMove);
    plot.addEventListener('pointerleave', this._onPointerLeave);
    plot.addEventListener('click', this._onPlotClick);
    plot.addEventListener('keydown', this._onKeyDown);
    plot.addEventListener('blur', this._onPointerLeave);
    this.addEventListener('pointerover', this._onSeriesHover);
    this.addEventListener('pointerleave', this._onSeriesLeave);
    this.addEventListener('focusin', this._onSeriesHover);
    this.addEventListener('focusout', this._onSeriesLeave);
    this._legend().addEventListener('click', this._onLegendClick);
    this._legend().addEventListener('keydown', this._onLegendKeyDown);
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
    this.removeEventListener('pointerover', this._onSeriesHover);
    this.removeEventListener('pointerleave', this._onSeriesLeave);
    this.removeEventListener('focusin', this._onSeriesHover);
    this.removeEventListener('focusout', this._onSeriesLeave);
    const legend = this.querySelector<HTMLElement>('.spending-chart-legend');
    legend?.removeEventListener('click', this._onLegendClick);
    legend?.removeEventListener('keydown', this._onLegendKeyDown);
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

  private _legend(): HTMLElement {
    return this.querySelector('.spending-chart-legend') as HTMLElement;
  }

  private _activeSeries(): string | null {
    return this._hoveredSeries ?? this._pinnedSeries;
  }

  private _draw(): void {
    const data = this._data;
    if (!data || !this.querySelector('.spending-chart')) return;
    const plot = this._plot();
    const svg = this.querySelector('svg') as SVGSVGElement;
    const width = plot.clientWidth || FALLBACK_WIDTH;
    this._lastWidth = plot.clientWidth;
    const { points, series, granularity } = data;

    plot.classList.toggle('spending-chart-plot--refreshing', data.isRefreshing);
    this._renderLegend();

    const last = points.at(-1);
    plot.setAttribute(
      'aria-label',
      last
        ? `${series.map((s) => `${s.label} : ${formatEuros(last.values[s.key])}`).join(', ')} au ${formatBucketLabel({ start: last.key, granularity })}. Flèches gauche et droite pour parcourir.`
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

    for (const { key, color } of series) {
      const coords = points.map((p, i) => `${x(i)},${y(p.values[key])}`);
      if (points.length > 1) {
        add('polyline', { class: 'spending-chart-line savings-chart-line', 'data-slice': key, style: `stroke: ${color}`, points: coords.join(' ') });
      }
      const lastIndex = points.length - 1;
      add('circle', {
        class: 'spending-chart-dot',
        'data-slice': key,
        style: `fill: ${color}`,
        cx: x(lastIndex),
        cy: y(points[lastIndex]!.values[key]),
        r: 3.5,
      });
    }

    if (this._activeIndex !== null) {
      const i = this._activeIndex;
      const p = points[i]!;
      add('line', { class: 'spending-chart-crosshair', x1: x(i), x2: x(i), y1: PAD.top, y2: PAD.top + innerH });
      for (const { key, color } of series) {
        add('circle', { class: 'spending-chart-dot', 'data-slice': key, style: `fill: ${color}`, cx: x(i), cy: y(p.values[key]), r: 4 });
      }
    }
    this._renderTooltip();
    this._syncActiveSeries();
  }

  /** Une ligne par courbe : valeur en fin de période ; cliquer la met en avant. */
  private _renderLegend(): void {
    const data = this._data;
    const last = data?.points.at(-1);
    const legend = this._legend();
    legend.innerHTML = (data?.series ?? [])
      .map((s) => {
        const value = formatEuros(last?.values[s.key] ?? 0);
        const pinned = this._pinnedSeries === s.key;
        return `
        <li class="spending-pie-legend-item" tabindex="0" role="button" aria-pressed="${pinned}" data-slice="${escapeAttr(s.key)}"
          aria-label="${escapeAttr(`${s.label} : ${value}`)}">
          <span class="spending-chart-swatch" style="background:${escapeAttr(s.color)}" aria-hidden="true"></span>
          <span class="spending-pie-legend-label">${escapeHtml(s.label)}</span>
          <span class="spending-pie-legend-amount">${escapeHtml(value)}</span>
        </li>`;
      })
      .join('');
  }

  private _syncActiveSeries(): void {
    const key = this._activeSeries();
    this.querySelector('.spending-chart-svg')?.classList.toggle('spending-chart-svg--focused', key !== null);
    this.querySelectorAll<HTMLElement | SVGElement>('[data-slice]').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.slice === key);
    });
    this._legend()
      .querySelectorAll<HTMLElement>('[data-slice]')
      .forEach((el) => el.setAttribute('aria-pressed', String(el.dataset.slice === this._pinnedSeries)));
  }

  private _onSeriesHover = (e: Event): void => {
    const key = sliceKeyOf(e.target);
    if (key === this._hoveredSeries) return;
    this._hoveredSeries = key;
    this._syncActiveSeries();
  };

  private _onSeriesLeave = (): void => {
    if (this._hoveredSeries === null) return;
    this._hoveredSeries = null;
    this._syncActiveSeries();
  };

  private _togglePinned(target: EventTarget | null): void {
    const key = sliceKeyOf(target);
    if (!key) return;
    this._pinnedSeries = this._pinnedSeries === key ? null : key;
    // Au toucher, le focus reste sur la ligne : on lâche le survol pour que le clic décide seul.
    this._hoveredSeries = null;
    this._syncActiveSeries();
  }

  private _onLegendClick = (e: Event): void => {
    this._togglePinned(e.target);
  };

  private _onLegendKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this._togglePinned(e.target);
  };

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
    for (const { key, label, color } of data.series) {
      const row = document.createElement('p');
      row.className = 'spending-chart-tooltip-row';
      const swatch = document.createElement('span');
      swatch.className = 'spending-chart-tooltip-key';
      swatch.style.background = color;
      swatch.setAttribute('aria-hidden', 'true');
      const strong = document.createElement('strong');
      strong.textContent = formatEuros(p.values[key]);
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
