/**
 * Tableau de bord du suivi des dépenses, en deux encarts qu'on fait défiler (onglets ou balayage) :
 * - « Total » : total de la période, dépenses / sorties, moyennes par jour, semaine, mois ;
 * - « Par catégorie » : total et moyennes de chaque catégorie d'emoji.
 * Chaque encart s'ouvre en grand pour l'étudier.
 *
 * API : render({ dashboard, isChartOpen, hasChart }).
 * Émet `spending-dashboard-change` quand l'encart observé change (la courbe le suit) ; le bouton de courbe
 * (`.spending-tracker-chart-toggle`) est géré par l'écran.
 */
import type {
  AverageUnit,
  SpendingAverage,
  SpendingCategoryStats,
  SpendingDashboard,
} from '../../application/spending-tracker/spending-dashboard.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

export type SpendingDashboardPanel = 'total' | 'categories';

export type SpendingDashboardRenderData = {
  dashboard: SpendingDashboard;
  isChartOpen: boolean;
  /** La courbe n'a de sens que s'il y a des dépenses. */
  hasChart: boolean;
};

export type BuddjSpendingDashboardElement = HTMLElement & {
  render: (data: SpendingDashboardRenderData) => void;
  readonly observed: SpendingDashboardPanel;
};

const PANELS: Array<{ id: SpendingDashboardPanel; label: string }> = [
  { id: 'total', label: 'Total' },
  { id: 'categories', label: 'Par catégorie' },
];

/** Catégories listées dans l'encart replié ; toutes le sont une fois ouvert en grand. */
const COMPACT_CATEGORY_COUNT = 4;

const UNIT_LABELS: Record<AverageUnit, string> = { day: 'par jour', week: 'par semaine', month: 'par mois' };
const UNIT_SHORT_LABELS: Record<AverageUnit, string> = { day: '/ jour', week: '/ sem.', month: '/ mois' };

const percentFormatter = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });

const CHART_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 6-6"/></svg>`;
const EXPAND_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>`;

function averagesNote(dashboard: SpendingDashboard): string {
  if (dashboard.elapsedDays === 0) return 'La période n’a pas encore commencé : pas de moyenne.';
  if (dashboard.units.length === 0) return 'Pas de moyenne sur une seule journée.';
  const days = dashboard.elapsedDays;
  return `Moyennes sur ${days} jour${days > 1 ? 's' : ''} écoulé${days > 1 ? 's' : ''}.`;
}

export class BuddjSpendingDashboard extends HTMLElement {
  static readonly tagName = 'buddj-spending-dashboard';

  private _data?: SpendingDashboardRenderData;
  private _observed: SpendingDashboardPanel = 'total';
  /** Encart ouvert en grand, null si aucun. */
  private _expanded: SpendingDashboardPanel | null = null;
  private _scrollFrame = 0;
  /** Encart ouvert en grand, rendu dans <body>. */
  private readonly _sheet: HTMLElement = (() => {
    const sheet = document.createElement('div');
    sheet.className = 'spending-dashboard-sheet';
    sheet.hidden = true;
    sheet.innerHTML = `
      <div class="spending-dashboard-sheet-backdrop" data-sheet-close></div>
      <div class="spending-dashboard-sheet-panel" role="dialog" aria-modal="true">
        <div class="spending-dashboard-sheet-header">
          <h2 class="spending-dashboard-sheet-title"></h2>
          <button type="button" class="spending-dashboard-sheet-close" data-sheet-close aria-label="Fermer">✕</button>
        </div>
        <div class="spending-dashboard-sheet-body"></div>
      </div>
    `;
    return sheet;
  })();

  get observed(): SpendingDashboardPanel {
    return this._observed;
  }

  connectedCallback(): void {
    if (!this.querySelector('.spending-dashboard')) {
      this.innerHTML = `
        <section class="spending-dashboard" aria-label="Tableau de bord">
          <div class="spending-dashboard-bar">
            <div class="spending-dashboard-tabs" role="tablist" aria-label="Encarts du tableau de bord">
              ${PANELS.map(
                (p) => `
              <button type="button" role="tab" class="spending-dashboard-tab" id="spending-dashboard-tab-${p.id}"
                data-panel="${p.id}" aria-controls="spending-dashboard-${p.id}">${escapeHtml(p.label)}</button>`
              ).join('')}
            </div>
            <span class="spending-dashboard-chart-toggle-slot"></span>
          </div>
          <div class="spending-dashboard-track" id="spending-dashboard-track">
            ${PANELS.map(
              (p) => `
            <div class="spending-dashboard-card" role="tabpanel" id="spending-dashboard-${p.id}"
              aria-labelledby="spending-dashboard-tab-${p.id}" data-panel="${p.id}">
              <button type="button" class="spending-dashboard-expand" data-expand="${p.id}"
                aria-label="${escapeAttr(`Ouvrir en grand : ${p.label}`)}">${EXPAND_ICON_SVG}</button>
              <div class="spending-dashboard-card-body"></div>
            </div>`
            ).join('')}
          </div>
        </section>
      `;
    }
    // La feuille vit dans <body> : l'écran crée un contexte d'empilement sous l'en-tête global.
    document.body.appendChild(this._sheet);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
    this._sheet.addEventListener('click', this._onClick);
    this._sheet.addEventListener('keydown', this._onKeyDown);
    this._track().addEventListener('scroll', this._onScroll, { passive: true });
    this._draw();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
    this._sheet.removeEventListener('click', this._onClick);
    this._sheet.removeEventListener('keydown', this._onKeyDown);
    this._sheet.remove();
    this.querySelector('.spending-dashboard-track')?.removeEventListener('scroll', this._onScroll);
    cancelAnimationFrame(this._scrollFrame);
  }

  render(data: SpendingDashboardRenderData): void {
    this._data = data;
    this._draw();
  }

  private _track(): HTMLElement {
    return this.querySelector('.spending-dashboard-track') as HTMLElement;
  }

  private _emitChange(): void {
    this.dispatchEvent(new CustomEvent('spending-dashboard-change', { bubbles: true }));
  }

  private _observe(panel: SpendingDashboardPanel, { scroll }: { scroll: boolean }): void {
    if (scroll) {
      const card = this.querySelector<HTMLElement>(`.spending-dashboard-card[data-panel="${panel}"]`);
      const track = this._track();
      if (card && typeof track.scrollTo === 'function') {
        track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
      }
    }
    if (panel === this._observed) return;
    this._observed = panel;
    this._syncTabs();
    this._syncTrackHeight();
    this._emitChange();
  }

  /** La piste prend la hauteur de l'encart observé : pas de vide sous un encart plus court. */
  private _syncTrackHeight(): void {
    const card = this.querySelector<HTMLElement>(`.spending-dashboard-card[data-panel="${this._observed}"]`);
    const height = card?.offsetHeight ?? 0;
    this._track().style.height = height > 0 ? `${height}px` : '';
  }

  /** Le balayage d'un encart à l'autre change l'encart observé. */
  private _onScroll = (): void => {
    cancelAnimationFrame(this._scrollFrame);
    this._scrollFrame = requestAnimationFrame(() => {
      const track = this._track();
      if (track.clientWidth === 0) return;
      const index = Math.round(track.scrollLeft / track.clientWidth);
      const panel = PANELS[Math.min(Math.max(index, 0), PANELS.length - 1)]!.id;
      this._observe(panel, { scroll: false });
    });
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    const tab = target.closest<HTMLElement>('.spending-dashboard-tab');
    if (tab) {
      this._observe(tab.dataset.panel as SpendingDashboardPanel, { scroll: true });
      return;
    }
    const expand = target.closest<HTMLElement>('.spending-dashboard-expand');
    if (expand) {
      this._expanded = expand.dataset.expand as SpendingDashboardPanel;
      this._observe(this._expanded, { scroll: true });
      this._drawSheet();
      (this._sheet.querySelector('.spending-dashboard-sheet-close') as HTMLElement | null)?.focus();
      return;
    }
    if (target.closest('[data-sheet-close]')) this._closeSheet();
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this._expanded) {
      e.preventDefault();
      this._closeSheet();
      return;
    }
    // Flèches gauche / droite entre les onglets
    const tab = (e.target as Element).closest('.spending-dashboard-tab');
    if (!tab || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    const index = PANELS.findIndex((p) => p.id === this._observed);
    const next = PANELS[(index + (e.key === 'ArrowRight' ? 1 : PANELS.length - 1)) % PANELS.length]!.id;
    this._observe(next, { scroll: true });
    this.querySelector<HTMLElement>(`#spending-dashboard-tab-${next}`)?.focus();
  };

  private _closeSheet(): void {
    const expanded = this._expanded;
    this._expanded = null;
    this._drawSheet();
    if (expanded) this.querySelector<HTMLElement>(`[data-expand="${expanded}"]`)?.focus();
  }

  private _syncTabs(): void {
    this.querySelectorAll<HTMLElement>('.spending-dashboard-tab').forEach((tab) => {
      const selected = tab.dataset.panel === this._observed;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  private _draw(): void {
    if (!this.querySelector('.spending-dashboard')) return;
    this._syncTabs();

    const data = this._data;
    const chartSlot = this.querySelector('.spending-dashboard-chart-toggle-slot') as HTMLElement;
    chartSlot.innerHTML =
      data && data.hasChart
        ? `<button type="button" class="spending-tracker-chart-toggle${data.isChartOpen ? ' spending-tracker-chart-toggle--open' : ''}"
            aria-label="Courbe cumulée" aria-expanded="${data.isChartOpen}" aria-controls="spending-tracker-chart">${CHART_ICON_SVG}</button>`
        : '';
    if (!data) return;

    const body = (panel: SpendingDashboardPanel): HTMLElement =>
      this.querySelector(`.spending-dashboard-card[data-panel="${panel}"] .spending-dashboard-card-body`) as HTMLElement;
    body('total').innerHTML = this._totalCardHtml(data.dashboard);
    body('categories').innerHTML = this._categoriesCardHtml(data.dashboard);
    this._syncTrackHeight();
    this._drawSheet();
  }

  private _drawSheet(): void {
    const sheet = this._sheet;
    const data = this._data;
    const expanded = this._expanded;
    sheet.hidden = !expanded || !data;
    if (!expanded || !data) return;
    const label = PANELS.find((p) => p.id === expanded)!.label;
    const panel = sheet.querySelector('.spending-dashboard-sheet-panel') as HTMLElement;
    panel.setAttribute('aria-label', label);
    (sheet.querySelector('.spending-dashboard-sheet-title') as HTMLElement).textContent = label;
    (sheet.querySelector('.spending-dashboard-sheet-body') as HTMLElement).innerHTML =
      expanded === 'total' ? this._totalDetailHtml(data.dashboard) : this._categoriesDetailHtml(data.dashboard);
  }

  private _totalCardHtml(dashboard: SpendingDashboard): string {
    const { totals, averages } = dashboard;
    return `
      <div class="spending-tracker-summary" role="status" aria-label="Total de la période">
        <p class="spending-tracker-total">${escapeHtml(formatEuros(totals.total))}</p>
        <p class="spending-tracker-split">
          <span class="spending-tracker-split-item spending-tracker-split-item--expense">Dépenses ${escapeHtml(formatEuros(totals.expensesTotal))}</span>
          <span class="spending-tracker-split-item spending-tracker-split-item--outflow">Sorties ${escapeHtml(formatEuros(totals.outflowsTotal))}</span>
        </p>
      </div>
      ${
        averages.length > 0
          ? `<ul class="spending-dashboard-averages" aria-label="Moyennes">
        ${averages
          .map(
            (a) => `
        <li class="spending-dashboard-average" aria-label="${escapeAttr(`Moyenne ${UNIT_LABELS[a.unit]} : ${formatEuros(a.total)}`)}">
          <span class="spending-dashboard-average-amount">${escapeHtml(formatEuros(a.total))}</span>
          <span class="spending-dashboard-average-unit">${escapeHtml(UNIT_SHORT_LABELS[a.unit])}</span>
        </li>`
          )
          .join('')}
      </ul>`
          : ''
      }`;
  }

  private _categoryRowHtml(category: SpendingCategoryStats, { withAverage }: { withAverage: boolean }): string {
    const name = category.title;
    const [firstAverage] = category.averages;
    const average =
      withAverage && firstAverage
        ? `<span class="spending-dashboard-category-average">${escapeHtml(`${formatEuros(firstAverage.total)} ${UNIT_SHORT_LABELS[firstAverage.unit]}`)}</span>`
        : '';
    return `
        <li class="spending-dashboard-category" aria-label="${escapeAttr(`${name} : ${formatEuros(category.total)}`)}">
          <span class="spending-dashboard-category-name">${escapeHtml(name)}</span>
          <span class="spending-dashboard-category-amounts">
            <span class="spending-dashboard-category-total">${escapeHtml(formatEuros(category.total))}</span>${average}
          </span>
          <span class="spending-dashboard-category-track" aria-hidden="true">
            <span class="spending-dashboard-category-fill" style="width:${(category.share * 100).toFixed(2)}%"></span>
          </span>
        </li>`;
  }

  private _categoriesCardHtml(dashboard: SpendingDashboard): string {
    const { categories } = dashboard;
    if (categories.length === 0) {
      return '<p class="spending-dashboard-empty">Aucune dépense sur cette période.</p>';
    }
    const shown = categories.slice(0, COMPACT_CATEGORY_COUNT);
    const hidden = categories.length - shown.length;
    return `
      <ul class="spending-dashboard-categories" aria-label="Dépenses par catégorie">
        ${shown.map((c) => this._categoryRowHtml(c, { withAverage: true })).join('')}
      </ul>
      ${
        hidden > 0
          ? `<p class="spending-dashboard-more">+ ${hidden} autre${hidden > 1 ? 's' : ''} catégorie${hidden > 1 ? 's' : ''}</p>`
          : ''
      }`;
  }

  private _amountCells(amounts: { total: number; expensesTotal: number; outflowsTotal: number }): string {
    return [amounts.total, amounts.expensesTotal, amounts.outflowsTotal]
      .map((value) => `<td>${escapeHtml(formatEuros(value))}</td>`)
      .join('');
  }

  private _totalDetailHtml(dashboard: SpendingDashboard): string {
    const { totals, averages } = dashboard;
    const share = (value: number): string => (totals.total > 0 ? percentFormatter.format(value / totals.total) : '–');
    return `
      <table class="spending-dashboard-table">
        <caption class="spending-dashboard-table-caption">Totaux et moyennes de la période</caption>
        <thead>
          <tr><th scope="col"></th><th scope="col">Total</th><th scope="col">Dépenses</th><th scope="col">Sorties</th></tr>
        </thead>
        <tbody>
          <tr class="spending-dashboard-table-row--total"><th scope="row">Sur la période</th>${this._amountCells(totals)}</tr>
          <tr class="spending-dashboard-table-row--share"><th scope="row">Part</th><td>${share(totals.total)}</td><td>${share(totals.expensesTotal)}</td><td>${share(totals.outflowsTotal)}</td></tr>
          ${averages
            .map(
              (a: SpendingAverage) =>
                `<tr><th scope="row">Moyenne ${escapeHtml(UNIT_LABELS[a.unit])}</th>${this._amountCells(a)}</tr>`
            )
            .join('')}
        </tbody>
      </table>
      <p class="spending-dashboard-note">${escapeHtml(averagesNote(dashboard))}</p>`;
  }

  private _categoriesDetailHtml(dashboard: SpendingDashboard): string {
    const { categories } = dashboard;
    if (categories.length === 0) {
      return '<p class="spending-dashboard-empty">Aucune dépense sur cette période.</p>';
    }
    return `
      <div class="spending-dashboard-category-details">
        ${categories
          .map((c) => {
            const name = c.title;
            return `
        <section class="spending-dashboard-category-detail" aria-label="${escapeAttr(name)}">
          <div class="spending-dashboard-category-detail-header">
            <h3 class="spending-dashboard-category-detail-title">${escapeHtml(name)}</h3>
            <span class="spending-dashboard-category-detail-total">${escapeHtml(formatEuros(c.total))}</span>
          </div>
          <span class="spending-dashboard-category-track" aria-hidden="true">
            <span class="spending-dashboard-category-fill" style="width:${(c.share * 100).toFixed(2)}%"></span>
          </span>
          <dl class="spending-dashboard-category-stats">
            <div><dt>Part du total</dt><dd>${escapeHtml(percentFormatter.format(c.share))}</dd></div>
            <div><dt>Dépenses</dt><dd>${escapeHtml(formatEuros(c.expensesTotal))}</dd></div>
            <div><dt>Sorties</dt><dd>${escapeHtml(formatEuros(c.outflowsTotal))}</dd></div>
            ${c.averages
              .map(
                (a) =>
                  `<div><dt>Moyenne ${escapeHtml(UNIT_LABELS[a.unit])}</dt><dd>${escapeHtml(formatEuros(a.total))}</dd></div>`
              )
              .join('')}
          </dl>
        </section>`;
          })
          .join('')}
      </div>
      <p class="spending-dashboard-note">${escapeHtml(averagesNote(dashboard))}</p>`;
  }
}

customElements.define(BuddjSpendingDashboard.tagName, BuddjSpendingDashboard);
