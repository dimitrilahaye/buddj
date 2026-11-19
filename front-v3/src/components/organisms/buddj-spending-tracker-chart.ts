/**
 * Courbe cumulée du suivi des dépenses : aires empilées (par type ou par catégorie, selon
 * l'encart observé), le haut de la pile est le total cumulé. SVG fait main, sans dépendance.
 *
 * Interaction : le réticule suit le pointeur (ou se pose au clic / au toucher) et s'aligne sur
 * la période la plus proche, l'infobulle donne les cumuls ; flèches gauche/droite au clavier.
 * Chaque entrée de la légende masque ou réaffiche sa courbe : la pile et les cumuls ne portent
 * alors que sur les courbes affichées (il en reste toujours au moins une).
 */
import { niceAxisTicks, type CumulativeStep } from '../../application/spending-tracker/spending-tracker-cumulative.js';
import type { ChartSeries, StackPoint } from '../../application/spending-tracker/spending-chart-series.js';
import { formatEuros } from '../../shared/goal.js';
import { formatBucketAxisLabel, formatBucketLabel } from '../../shared/spending-bucket-label.js';

export type SpendingTrackerChartData = {
  title: string;
  /** Séries de bas en haut de la pile */
  series: ChartSeries[];
  /** Points cumulés, déjà filtrés par type */
  points: StackPoint[];
  step: CumulativeStep;
  selectedKey: string | null;
  isRefreshing: boolean;
};

function pointLabel({ key, step }: { key: string; step: CumulativeStep }): string {
  if (step === 'hour') return `${key} h – ${Number(key) + 1} h`;
  return formatBucketLabel({ start: key, granularity: step });
}

function pointAxisLabel({ key, step }: { key: string; step: CumulativeStep }): string {
  if (step === 'hour') return `${key} h`;
  return formatBucketAxisLabel({ start: key, granularity: step });
}

const BUCKET_TOTAL_LABELS: Record<CumulativeStep, string> = {
  hour: 'cette heure-là',
  day: 'ce jour',
  week: 'cette semaine-là',
  month: 'ce mois-là',
};

const HEIGHT = 200;
const PAD = { top: 24, right: 16, bottom: 26, left: 52 };
const FALLBACK_WIDTH = 340;
const SVG_NS = 'http://www.w3.org/2000/svg';

function compactEuros(value: number): string {
  if (value >= 10_000) return `${Math.round(value / 1000)} k€`;
  return `${Math.round(value)} €`;
}

export class BuddjSpendingTrackerChart extends HTMLElement {
  static readonly tagName = 'buddj-spending-tracker-chart';

  private _data?: SpendingTrackerChartData;
  private _points: StackPoint[] = [];
  private _activeIndex: number | null = null;
  private _xs: number[] = [];
  private _resizeObserver?: ResizeObserver;
  private _lastWidth = 0;
  /** Séries masquées via la légende, par clé. */
  private readonly _hidden = new Set<string>();

  connectedCallback(): void {
    if (!this.querySelector('.spending-chart')) {
      this.innerHTML = `
        <figure class="spending-chart">
          <figcaption class="spending-chart-caption">
            <span class="spending-chart-title">Cumul sur la période</span>
            <span class="spending-chart-legend"></span>
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
    plot.addEventListener('click', this._onClick);
    plot.addEventListener('keydown', this._onKeyDown);
    plot.addEventListener('blur', this._onPointerLeave);
    this.querySelector('.spending-chart-legend')?.addEventListener('click', this._onLegendClick);
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
    plot?.removeEventListener('click', this._onClick);
    plot?.removeEventListener('keydown', this._onKeyDown);
    plot?.removeEventListener('blur', this._onPointerLeave);
    this._resizeObserver?.disconnect();
    this.querySelector('.spending-chart-legend')?.removeEventListener('click', this._onLegendClick);
  }

  render(data: SpendingTrackerChartData): void {
    this._data = data;
    // Une série disparue n'est plus masquée ; si toutes le sont, on les réaffiche.
    const keys = new Set(data.series.map((s) => s.key));
    [...this._hidden].filter((key) => !keys.has(key)).forEach((key) => this._hidden.delete(key));
    if (data.series.every((s) => this._hidden.has(s.key))) this._hidden.clear();
    this._points = this._visiblePoints();
    if (this._activeIndex !== null && this._activeIndex >= this._points.length) this._activeIndex = null;
    this._draw();
  }

  private _plot(): HTMLElement {
    return this.querySelector('.spending-chart-plot') as HTMLElement;
  }

  /** Séries affichées, de bas en haut de la pile. */
  private _series(): ChartSeries[] {
    return (this._data?.series ?? []).filter((s) => !this._hidden.has(s.key));
  }

  /** Points recalculés sur les seules séries affichées (cumul et montant de la période). */
  private _visiblePoints(): StackPoint[] {
    const data = this._data;
    if (!data) return [];
    if (this._hidden.size === 0) return data.points;
    const keys = this._series().map((s) => s.key);
    const sum = (p: StackPoint | undefined): number => keys.reduce((total, key) => total + (p?.values[key] ?? 0), 0);
    const round = (value: number): number => Math.round(value * 100) / 100;
    return data.points.map((p, i) => ({
      ...p,
      total: round(sum(p)),
      bucketTotal: round(sum(p) - sum(data.points[i - 1])),
    }));
  }

  private _draw(): void {
    const data = this._data;
    if (!data || !this.querySelector('.spending-chart')) return;
    const plot = this._plot();
    const svg = this.querySelector('svg') as SVGSVGElement;
    const width = plot.clientWidth || FALLBACK_WIDTH;
    this._lastWidth = plot.clientWidth;
    const points = this._points;
    const series = this._series();
    const { step } = data;

    plot.classList.toggle('spending-chart-plot--refreshing', data.isRefreshing);
    (this.querySelector('.spending-chart-title') as HTMLElement).textContent = data.title;
    this._renderLegend(this._data?.series ?? []);

    const last = points.at(-1);
    const total = last?.total ?? 0;
    plot.setAttribute(
      'aria-label',
      last
        ? `Cumul de ${formatEuros(total)} ${step === 'hour' ? `à ${last.key} h` : `au ${pointLabel({ key: last.key, step })}`}. Flèches gauche et droite pour parcourir.`
        : 'Aucune donnée'
    );

    const ticks = niceAxisTicks({ max: total });
    const yMax = ticks.at(-1) || 1;
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number): number =>
      points.length <= 1 ? PAD.left + innerW / 2 : PAD.left + (i / (points.length - 1)) * innerW;
    const y = (value: number): number => PAD.top + innerH - (value / yMax) * innerH;
    this._xs = points.map((_, i) => x(i));

    svg.setAttribute('viewBox', `0 0 ${width} ${HEIGHT}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(HEIGHT));
    svg.replaceChildren();

    const add = <K extends keyof SVGElementTagNameMap>(
      tag: K,
      attrs: Record<string, string | number>,
      parent: SVGElement = svg
    ): SVGElementTagNameMap[K] => {
      const el = document.createElementNS(SVG_NS, tag);
      Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
      parent.appendChild(el);
      return el;
    };

    // Grille et graduations (hairline, recessive)
    for (const tick of ticks) {
      add('line', { class: 'spending-chart-grid', x1: PAD.left, x2: width - PAD.right, y1: y(tick), y2: y(tick) });
      const label = add('text', { class: 'spending-chart-tick', x: PAD.left - 8, y: y(tick) + 4, 'text-anchor': 'end' });
      label.textContent = compactEuros(tick);
    }

    // Axe des périodes : premier, milieu, dernier
    if (points.length > 0) {
      const indexes = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
      for (const i of indexes) {
        const anchor = points.length === 1 ? 'middle' : i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle';
        const label = add('text', { class: 'spending-chart-tick', x: x(i), y: HEIGHT - 6, 'text-anchor': anchor });
        label.textContent = pointAxisLabel({ key: points[i]!.key, step });
      }
    }

    if (points.length === 0) return;

    // Aires empilées, dans l'ordre des séries (de bas en haut)
    let lower = points.map(() => 0);
    for (const { key, color } of series) {
      const upper = points.map((p, i) => lower[i]! + (p.values[key] ?? 0));
      const top = points.map((_, i) => `${x(i)},${y(upper[i]!)}`);
      const bottom = points.map((_, i) => `${x(i)},${y(lower[i]!)}`).reverse();
      if (points.length > 1) {
        add('polygon', { class: 'spending-chart-area', style: `fill: ${color}`, points: [...top, ...bottom].join(' ') });
        add('polyline', { class: 'spending-chart-line', style: `stroke: ${color}`, points: top.join(' ') });
      }
      lower = upper;
    }

    // Période sélectionnée (détail affiché)
    const selectedIndex = points.findIndex((p) => p.key === data.selectedKey);
    if (selectedIndex >= 0) {
      add('line', {
        class: 'spending-chart-selected',
        x1: x(selectedIndex),
        x2: x(selectedIndex),
        y1: PAD.top,
        y2: PAD.top + innerH,
      });
    }

    // Point final + valeur au bout de la courbe
    const topColor = series.at(-1)?.color ?? 'var(--coral)';
    const lastIndex = points.length - 1;
    add('circle', { class: 'spending-chart-dot', style: `fill: ${topColor}`, cx: x(lastIndex), cy: y(total), r: 4 });
    const endLabel = add('text', {
      class: 'spending-chart-end-label',
      x: x(lastIndex),
      y: Math.max(y(total) - 10, 12),
      'text-anchor': points.length === 1 ? 'middle' : 'end',
    });
    endLabel.textContent = formatEuros(total);

    // Réticule de survol
    if (this._activeIndex !== null) {
      const i = this._activeIndex;
      const p = points[i]!;
      add('line', { class: 'spending-chart-crosshair', x1: x(i), x2: x(i), y1: PAD.top, y2: PAD.top + innerH });
      add('circle', { class: 'spending-chart-dot', style: `fill: ${topColor}`, cx: x(i), cy: y(p.total), r: 4 });
    }
    this._renderTooltip();
  }

  private _renderLegend(series: ChartSeries[]): void {
    const legend = this.querySelector('.spending-chart-legend') as HTMLElement;
    legend.replaceChildren();
    // Une seule série : le titre suffit, pas de légende.
    if (series.length < 2) return;
    const visibleCount = series.filter((s) => !this._hidden.has(s.key)).length;
    for (const { key, color, label } of [...series].reverse()) {
      const shown = !this._hidden.has(key);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'spending-chart-legend-item';
      item.dataset.series = key;
      item.setAttribute('aria-pressed', String(shown));
      item.setAttribute('aria-label', `Courbe ${label}`);
      // La dernière courbe affichée ne se masque pas.
      item.disabled = shown && visibleCount === 1;
      const swatch = document.createElement('span');
      swatch.className = 'spending-chart-swatch';
      swatch.style.background = color;
      swatch.setAttribute('aria-hidden', 'true');
      item.append(swatch, document.createTextNode(label));
      legend.appendChild(item);
    }
  }

  private _renderTooltip(): void {
    const tooltip = this.querySelector('.spending-chart-tooltip') as HTMLElement;
    const data = this._data;
    const i = this._activeIndex;
    if (!data || i === null || !this._points[i]) {
      tooltip.hidden = true;
      tooltip.replaceChildren();
      return;
    }
    const p = this._points[i];
    const rows: Array<[string, string, string | null]> = [
      [formatEuros(p.total), 'cumulés', null],
      ...this._series()
        .slice()
        .reverse()
        .map(({ key, label, color }): [string, string, string] => [formatEuros(p.values[key] ?? 0), label, color]),
      [formatEuros(p.bucketTotal), BUCKET_TOTAL_LABELS[data.step], null],
    ];
    tooltip.replaceChildren();
    const title = document.createElement('p');
    title.className = 'spending-chart-tooltip-title';
    title.textContent = pointLabel({ key: p.key, step: data.step });
    tooltip.appendChild(title);
    for (const [value, label, color] of rows) {
      const row = document.createElement('p');
      row.className = 'spending-chart-tooltip-row';
      if (color) {
        const key = document.createElement('span');
        key.className = 'spending-chart-tooltip-key';
        key.style.background = color;
        key.setAttribute('aria-hidden', 'true');
        row.appendChild(key);
      }
      const strong = document.createElement('strong');
      strong.textContent = value;
      row.append(strong, document.createTextNode(` ${label}`));
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
    const rect = this._plot().getBoundingClientRect();
    const localX = clientX - rect.left;
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

  /** Masque ou réaffiche la courbe d'une entrée de la légende. */
  private _onLegendClick = (e: Event): void => {
    const item = (e.target as Element).closest<HTMLButtonElement>('.spending-chart-legend-item');
    const key = item?.dataset.series;
    if (!item || !key || item.disabled) return;
    if (this._hidden.has(key)) this._hidden.delete(key);
    else this._hidden.add(key);
    this._points = this._visiblePoints();
    this._draw();
  };

  private _onPointerMove = (e: PointerEvent): void => {
    this._setActive(this._nearestIndex(e.clientX));
  };

  private _onPointerLeave = (): void => {
    this._setActive(null);
  };

  /** Au toucher, pas de survol : le clic pose le réticule. */
  private _onClick = (e: MouseEvent): void => {
    this._setActive(this._nearestIndex(e.clientX));
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    const count = this._points.length;
    if (count === 0) return;
    const current = this._activeIndex ?? count - 1;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this._setActive(Math.max(0, this._activeIndex === null ? count - 1 : current - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this._setActive(Math.min(count - 1, this._activeIndex === null ? count - 1 : current + 1));
    } else if (e.key === 'Escape') {
      this._setActive(null);
    }
  };
}

customElements.define(BuddjSpendingTrackerChart.tagName, BuddjSpendingTrackerChart);
