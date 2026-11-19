/**
 * Tableau de bord du suivi des dépenses, en deux encarts qu'on fait défiler (onglets ou balayage) :
 * - « Total » : total de la période, dépenses / sorties, moyennes par jour, semaine, mois ;
 * - « Par catégorie » : total et moyennes de chaque catégorie d'emoji.
 * Des points sous les encarts indiquent qu'on peut balayer de l'un à l'autre.
 * Chaque encart s'ouvre en grand pour l'étudier ; on y balaie aussi d'un encart à l'autre (points en haut et en bas).
 * Ouvert en grand, chaque catégorie montre son total sur la période ; ses parts et moyennes se déplient à la demande.
 *
 * API : render({ dashboard, openChart, hasChart }).
 * Émet `spending-dashboard-change` quand l'encart observé change (les graphiques le suivent) ; les boutons
 * de courbe (`.spending-tracker-chart-toggle`) et de répartition (`.spending-tracker-pie-toggle`) sont gérés par l'écran.
 */
import type {
  AverageUnit,
  SpendingAmounts,
  SpendingAverage,
  SpendingCategoryStats,
  SpendingDashboard,
} from '../../application/spending-tracker/spending-dashboard.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import './buddj-swipe-sheet.js';
import type { BuddjSwipeSheet, SwipeSheetEventDetail } from './buddj-swipe-sheet.js';
import { formatEuros } from '../../shared/goal.js';

export type SpendingDashboardPanel = 'total' | 'categories';

/** Graphique déplié sous le tableau de bord : courbe cumulée ou répartition en anneau. */
export type SpendingTrackerChartKind = 'curve' | 'pie';

export type SpendingDashboardRenderData = {
  dashboard: SpendingDashboard;
  openChart: SpendingTrackerChartKind | null;
  /** Les graphiques n'ont de sens que s'il y a des dépenses. */
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
const PIE_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/></svg>`;
const EXPAND_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/></svg>`;

/** Points de pagination : un par encart, celui observé mis en avant. Décoratifs, les onglets portent l'accessibilité. */
function cardDotsHtml(): string {
  return `
    <div class="pager-dots spending-dashboard-dots" aria-hidden="true">
      ${PANELS.map((p) => `<button type="button" tabindex="-1" class="pager-dot" data-dot="${p.id}"></button>`).join('')}
    </div>`;
}

function categoryToggleText(open: boolean): string {
  return open ? 'Masquer les parts et moyennes' : 'Parts et moyennes';
}

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
  private _scrollFrame = 0;
  private _resizeObserver?: ResizeObserver;
  /** Catégories dont les parts et moyennes sont dépliées, ouvert en grand. */
  private readonly _openCategoryDetails = new Set<string>();
  /** Encart ouvert en grand, rendu dans <body>. */
  private readonly _sheet: BuddjSwipeSheet = (() => {
    const sheet = document.createElement('buddj-swipe-sheet') as BuddjSwipeSheet;
    sheet.classList.add('spending-dashboard-sheet');
    sheet.setPages(PANELS);
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
          ${cardDotsHtml()}
        </section>
      `;
    }
    // La feuille vit dans <body> : l'écran crée un contexte d'empilement sous l'en-tête global.
    document.body.appendChild(this._sheet);
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
    this._sheet.addEventListener('click', this._onSheetClick);
    this._sheet.addEventListener('swipe-sheet-change', this._onSheetChange);
    this._sheet.addEventListener('swipe-sheet-close', this._onSheetClose);
    this._track().addEventListener('scroll', this._onScroll, { passive: true });
    // Le contenu d'un encart peut changer de hauteur après coup (polices chargées, largeur).
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver(() => this._syncTrackHeight());
      this.querySelectorAll('.spending-dashboard-card').forEach((card) => this._resizeObserver?.observe(card));
    }
    this._draw();
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
    this._sheet.removeEventListener('click', this._onSheetClick);
    this._sheet.removeEventListener('swipe-sheet-change', this._onSheetChange);
    this._sheet.removeEventListener('swipe-sheet-close', this._onSheetClose);
    this._sheet.remove();
    this._resizeObserver?.disconnect();
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

  /** Le balayage d'une page à l'autre dans la feuille ouverte en grand change l'encart observé (et les graphiques). */
  private _onSheetChange = (e: Event): void => {
    this._observe((e as CustomEvent<SwipeSheetEventDetail>).detail.id as SpendingDashboardPanel, { scroll: true });
  };

  private _onSheetClose = (e: Event): void => {
    const { id } = (e as CustomEvent<SwipeSheetEventDetail>).detail;
    this.querySelector<HTMLElement>(`[data-expand="${id}"]`)?.focus();
  };

  private _openSheet(panel: SpendingDashboardPanel): void {
    this._observe(panel, { scroll: true });
    this._drawSheet();
    this._sheet.open(panel);
  }

  /** Déplie / replie les parts et moyennes d'une catégorie ouverte en grand. */
  private _onSheetClick = (e: Event): void => {
    const toggle = (e.target as Element).closest<HTMLElement>('.spending-dashboard-category-toggle');
    if (!toggle) return;
    const id = toggle.dataset.category!;
    const open = !this._openCategoryDetails.has(id);
    if (open) this._openCategoryDetails.add(id);
    else this._openCategoryDetails.delete(id);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = categoryToggleText(open);
    toggle.closest('table')?.querySelectorAll<HTMLElement>('.spending-dashboard-table-group').forEach((group) => {
      group.hidden = !open;
    });
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    const tab = target.closest<HTMLElement>('.spending-dashboard-tab');
    if (tab) {
      this._observe(tab.dataset.panel as SpendingDashboardPanel, { scroll: true });
      return;
    }
    const dot = target.closest<HTMLElement>('.pager-dot');
    if (dot) {
      this._observe(dot.dataset.dot as SpendingDashboardPanel, { scroll: true });
      return;
    }
    const expand = target.closest<HTMLElement>('.spending-dashboard-expand');
    if (expand) this._openSheet(expand.dataset.expand as SpendingDashboardPanel);
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    // Flèches gauche / droite entre les onglets
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!(e.target as Element).closest('.spending-dashboard-tab')) return;
    e.preventDefault();
    const index = PANELS.findIndex((p) => p.id === this._observed);
    const next = PANELS[(index + (e.key === 'ArrowRight' ? 1 : PANELS.length - 1)) % PANELS.length]!.id;
    this._observe(next, { scroll: true });
    this.querySelector<HTMLElement>(`#spending-dashboard-tab-${next}`)?.focus();
  };

  private _syncTabs(): void {
    this.querySelectorAll<HTMLElement>('.spending-dashboard-tab').forEach((tab) => {
      const selected = tab.dataset.panel === this._observed;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    this.querySelectorAll<HTMLElement>('.pager-dot').forEach((dot) => {
      dot.classList.toggle('pager-dot--active', dot.dataset.dot === this._observed);
    });
  }

  private _draw(): void {
    if (!this.querySelector('.spending-dashboard')) return;
    this._syncTabs();

    const data = this._data;
    const chartSlot = this.querySelector('.spending-dashboard-chart-toggle-slot') as HTMLElement;
    const toggle = ({ kind, className, label, controls, icon }: { kind: SpendingTrackerChartKind; className: string; label: string; controls: string; icon: string }): string => {
      const open = data?.openChart === kind;
      return `<button type="button" class="spending-tracker-chart-toggle ${className}${open ? ' spending-tracker-chart-toggle--open' : ''}"
            aria-label="${label}" aria-expanded="${open}" aria-controls="${controls}">${icon}</button>`;
    };
    chartSlot.innerHTML =
      data && data.hasChart
        ? toggle({ kind: 'curve', className: 'spending-tracker-curve-toggle', label: 'Courbe cumulée', controls: 'spending-tracker-chart', icon: CHART_ICON_SVG }) +
          toggle({ kind: 'pie', className: 'spending-tracker-pie-toggle', label: 'Répartition', controls: 'spending-tracker-pie', icon: PIE_ICON_SVG })
        : '';
    if (!data) return;

    const body = (panel: SpendingDashboardPanel): HTMLElement =>
      this.querySelector(`.spending-dashboard-card[data-panel="${panel}"] .spending-dashboard-card-body`) as HTMLElement;
    body('total').innerHTML = this._totalCardHtml(data.dashboard);
    body('categories').innerHTML = this._categoriesCardHtml(data.dashboard);
    this._syncTrackHeight();
    if (this._sheet.current !== null) this._drawSheet();
  }

  /** Contenu des deux pages ouvertes en grand (la feuille garde la page affichée). */
  private _drawSheet(): void {
    const data = this._data;
    if (!data) {
      this._sheet.close();
      return;
    }
    this._sheet.page('total').innerHTML = this._totalDetailHtml(data.dashboard);
    this._sheet.page('categories').innerHTML = this._categoriesDetailHtml(data.dashboard);
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

  /**
   * Tableau commun au total et à chaque catégorie : montants de la période, part du total de toute la période
   * (et, pour une catégorie, part de chaque colonne sur l'ensemble des catégories), puis moyennes,
   * en colonnes Total / Dépenses / Sorties.
   */
  private _amountsTableHtml({
    caption,
    captionClass,
    amounts,
    averages,
    periodTotal,
    columnTotals,
    shareBar = false,
    collapsible,
  }: {
    caption: string;
    captionClass: string;
    amounts: SpendingAmounts;
    averages: SpendingAverage[];
    periodTotal: number;
    /** Totaux de chaque colonne sur l'ensemble des catégories : ajoute la part colonne par colonne */
    columnTotals?: SpendingAmounts;
    shareBar?: boolean;
    /** Parts et moyennes repliées derrière un bouton ; `open` dit si elles sont dépliées. */
    collapsible?: { id: string; open: boolean };
  }): string {
    const cells = (values: string[]): string => values.map((v) => `<td>${escapeHtml(v)}</td>`).join('');
    const euros = (a: SpendingAmounts): string[] => [a.total, a.expensesTotal, a.outflowsTotal].map(formatEuros);
    const ratio = (value: number, of: number): string => (of > 0 ? percentFormatter.format(value / of) : '–');
    const columns = (a: SpendingAmounts): number[] => [a.total, a.expensesTotal, a.outflowsTotal];
    const periodShares = columns(amounts).map((v) => ratio(v, periodTotal));
    const categoryShares = columnTotals
      ? columns(amounts).map((v, i) => ratio(v, columns(columnTotals)[i]!))
      : null;
    // Groupe de lignes coiffé d'une en-tête intermédiaire, ses lignes en retrait dessous
    const group = (title: string, rows: Array<{ label: string; values: string[] }>): string => `
        <tbody class="spending-dashboard-table-group"${collapsible && !collapsible.open ? ' hidden' : ''}>
          <tr><th scope="rowgroup" colspan="4" class="spending-dashboard-table-group-title">${escapeHtml(title)}</th></tr>
          ${rows.map((r) => `<tr><th scope="row" class="spending-dashboard-table-subrow">${escapeHtml(r.label)}</th>${cells(r.values)}</tr>`).join('')}
        </tbody>`;
    return `
      <table class="spending-dashboard-table">
        <caption class="${captionClass}">${escapeHtml(caption)}${
          shareBar
            ? `<span class="spending-dashboard-category-track" aria-hidden="true">
            <span class="spending-dashboard-category-fill" style="width:${(periodTotal > 0 ? (amounts.total / periodTotal) * 100 : 0).toFixed(2)}%"></span>
          </span>`
            : ''
        }</caption>
        <thead>
          <tr><th scope="col"></th><th scope="col">Total</th><th scope="col">Dépenses</th><th scope="col">Sorties</th></tr>
        </thead>
        <tbody>
          <tr class="spending-dashboard-table-row--total"><th scope="row">Sur la période</th>${cells(euros(amounts))}</tr>
          ${
            categoryShares
              ? ''
              : `<tr class="spending-dashboard-table-row--share"><th scope="row">Part sur toute la période</th>${cells(periodShares)}</tr>`
          }
        </tbody>
        ${
          categoryShares
            ? group('Parts', [
                { label: 'sur toute la période', values: periodShares },
                { label: 'sur l’ensemble des catégories', values: categoryShares },
              ])
            : ''
        }
        ${averages.length > 0 ? group('Moyennes', averages.map((a) => ({ label: UNIT_LABELS[a.unit], values: euros(a) }))) : ''}
        ${
          collapsible
            ? `<tfoot>
          <tr><td colspan="4" class="spending-dashboard-table-toggle-cell">
            <button type="button" class="spending-dashboard-category-toggle" data-category="${escapeAttr(collapsible.id)}"
              aria-expanded="${collapsible.open}" aria-label="${escapeAttr(`Parts et moyennes : ${caption}`)}">${categoryToggleText(collapsible.open)}</button>
          </td></tr>
        </tfoot>`
            : ''
        }
      </table>`;
  }

  private _totalDetailHtml(dashboard: SpendingDashboard): string {
    const { totals, averages } = dashboard;
    return `
      ${this._amountsTableHtml({
        caption: 'Totaux et moyennes de la période',
        captionClass: 'spending-dashboard-table-caption',
        amounts: totals,
        averages,
        periodTotal: totals.total,
      })}
      <p class="spending-dashboard-note">${escapeHtml(averagesNote(dashboard))}</p>`;
  }

  private _categoriesDetailHtml(dashboard: SpendingDashboard): string {
    const { categories, totals } = dashboard;
    if (categories.length === 0) {
      return '<p class="spending-dashboard-empty">Aucune dépense sur cette période.</p>';
    }
    return `
      <div class="spending-dashboard-category-tables">
        ${categories
          .map((c) =>
            this._amountsTableHtml({
              caption: c.title,
              captionClass: 'spending-dashboard-table-caption spending-dashboard-table-caption--title',
              amounts: c,
              averages: c.averages,
              periodTotal: totals.total,
              columnTotals: totals,
              shareBar: true,
              collapsible: { id: c.id, open: this._openCategoryDetails.has(c.id) },
            })
          )
          .join('')}
      </div>
      <p class="spending-dashboard-note">${escapeHtml(averagesNote(dashboard))}</p>`;
  }
}

customElements.define(BuddjSpendingDashboard.tagName, BuddjSpendingDashboard);
