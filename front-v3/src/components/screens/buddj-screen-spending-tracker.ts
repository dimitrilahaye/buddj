/**
 * Écran « Suivi des dépenses » : dépenses hebdo et sorties ajoutées au fil de l'eau,
 * regroupées par jour, semaine ou mois (GET /spending-tracker).
 * Raccourcis (aujourd'hui, cette semaine, ce mois) ou plage libre via un calendrier unique ;
 * filtre par type côté front, sans rechargement.
 * Un tableau de bord (total, moyennes, catégories) résume la période ; la courbe cumulée
 * suit l'encart observé (par type ou par catégorie).
 */
import type { SpendingTrackerStore } from '../../application/spending-tracker/spending-tracker-store.js';
import { filterSpendingTrackerView } from '../../application/spending-tracker/spending-tracker-filter.js';
import { rangeForShortcut, todayIso } from '../../application/spending-tracker/spending-tracker-range.js';
import type {
  SpendingBucket,
  SpendingGranularity,
  SpendingRange,
  SpendingRangeShortcut,
  SpendingTrackerView,
  TrackedSpendingEntry,
  TrackedSpendingKind,
} from '../../application/spending-tracker/spending-tracker-types.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';
import {
  formatBucketLabel,
  formatDaySpanLabel,
  formatRangeLabel,
} from '../../shared/spending-bucket-label.js';
import {
  cumulativeSpending,
  hourlyCumulativeSpending,
} from '../../application/spending-tracker/spending-tracker-cumulative.js';
import { spendingDashboard } from '../../application/spending-tracker/spending-dashboard.js';
import { categoryStack, kindStack } from '../../application/spending-tracker/spending-chart-series.js';
import '../organisms/buddj-spending-tracker-chart.js';
import '../organisms/buddj-spending-dashboard.js';
import type { BuddjSpendingDashboardElement } from '../organisms/buddj-spending-dashboard.js';
import '../organisms/buddj-date-range-picker-drawer.js';
import type { BuddjDateRangePickerDrawerElement } from '../organisms/buddj-date-range-picker-drawer.js';
import type {
  BuddjSpendingTrackerChart,
  SpendingBucketSelect,
} from '../organisms/buddj-spending-tracker-chart.js';

const BUDDJ_CHART_TAG = 'buddj-spending-tracker-chart';

/** Clé de sélection de la ligne « toute la période » (jamais une date de bucket). */
const PERIOD_KEY = 'period';

const DEFAULT_SHORTCUT: SpendingRangeShortcut = 'month';

const SHORTCUTS: Array<{ value: SpendingRangeShortcut; label: string }> = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
];

const KIND_LABELS: Record<TrackedSpendingKind, string> = {
  expense: 'Dépense',
  outflow: 'Sortie',
};

const GRANULARITY_LIST_LABELS: Record<SpendingGranularity, string> = {
  day: 'Dépenses par jour',
  week: 'Dépenses par semaine',
  month: 'Dépenses par mois',
};

const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dayHeadingFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });

/** Dépenses du récap, de la plus ancienne à la plus récente. */
function chronological(entries: TrackedSpendingEntry[]): TrackedSpendingEntry[] {
  return [...entries].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

/** Jour local (celui de l'heure affichée) d'une dépense. */
function localDayOf(entry: TrackedSpendingEntry): string {
  const d = new Date(entry.occurredAt);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

type SpendingDayGroup = { label: string; entries: TrackedSpendingEntry[] };

/** Regroupe des dépenses déjà triées chronologiquement par jour local, dans l'ordre. */
function groupByDay(entries: TrackedSpendingEntry[]): SpendingDayGroup[] {
  const groups: Array<SpendingDayGroup & { day: string }> = [];
  for (const entry of entries) {
    const day = localDayOf(entry);
    const last = groups.at(-1);
    if (last?.day === day) last.entries.push(entry);
    else groups.push({ day, label: dayHeadingFormatter.format(new Date(entry.occurredAt)), entries: [entry] });
  }
  return groups;
}

function dayTotal({ entries }: SpendingDayGroup): number {
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}

/** Récap affiché sous une ligne : `key` est PERIOD_KEY ou le start du bucket. */
type SpendingDetail = {
  key: string;
  label: string;
  entries: TrackedSpendingEntry[];
};

export class BuddjScreenSpendingTracker extends HTMLElement {
  static readonly tagName = 'buddj-screen-spending-tracker';

  private _store?: SpendingTrackerStore;
  private _main?: HTMLElement;
  /** Bucket dont le détail est affiché (start), PERIOD_KEY pour toute la période, null si aucun. */
  private _selectedStart: string | null = null;
  /** Courbe cumulée repliée par défaut, dépliée via l'icône du tableau de bord. */
  private _isChartOpen = false;

  init({ spendingTrackerStore }: { spendingTrackerStore: SpendingTrackerStore }): void {
    this._store = spendingTrackerStore;
  }

  connectedCallback(): void {
    if (this.querySelector('#spending-tracker')) return;
    const store = this._store;
    if (!store) return;

    const main = document.createElement('main');
    this._main = main;
    main.id = 'spending-tracker';
    main.className = 'screen screen--spending-tracker';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap spending-tracker-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Suivi des dépenses</h1>
        </header>
      </div>
      <div class="spending-tracker-content">
        <form class="spending-tracker-filters" aria-label="Filtres du suivi des dépenses" novalidate>
          <fieldset class="spending-tracker-fieldset spending-tracker-shortcuts">
            <legend class="spending-tracker-legend">Période</legend>
            ${SHORTCUTS.map(
              (s) => `
            <label class="spending-tracker-chip">
              <input type="radio" name="spending-shortcut" value="${s.value}">
              <span>${escapeHtml(s.label)}</span>
            </label>`
            ).join('')}
          </fieldset>
          <button type="button" class="spending-tracker-range-button" aria-haspopup="dialog">
            <span class="spending-tracker-range-icon" aria-hidden="true">📅</span>
            <span class="spending-tracker-range-text">Choisir des dates</span>
          </button>
          <fieldset class="spending-tracker-fieldset spending-tracker-kinds">
            <legend class="spending-tracker-legend">Types</legend>
            <label class="spending-tracker-chip">
              <input type="checkbox" name="spending-kind" value="expense">
              <span>Dépenses</span>
            </label>
            <label class="spending-tracker-chip">
              <input type="checkbox" name="spending-kind" value="outflow">
              <span>Sorties</span>
            </label>
          </fieldset>
        </form>
        <section class="spending-tracker-results" aria-label="Résultats du suivi des dépenses">
          <p class="spending-tracker-loading" hidden>Chargement du suivi…</p>
          <div class="spending-tracker-error" role="alert" hidden>
            <p class="spending-tracker-error-text">Impossible d’afficher ton suivi pour le moment. Vérifie ta connexion puis réessaie.</p>
            <button type="button" class="btn spending-tracker-retry">Réessayer</button>
          </div>
          <buddj-spending-dashboard hidden></buddj-spending-dashboard>
          <buddj-spending-tracker-chart id="spending-tracker-chart" hidden></buddj-spending-tracker-chart>
          <ol class="spending-tracker-bars"></ol>
          <div class="spending-tracker-empty" hidden>
            <p class="spending-tracker-empty-title">Aucune dépense sur cette période.</p>
            <p class="spending-tracker-empty-hint">Les dépenses et sorties que tu ajoutes à un mois apparaissent ici au fil de l’eau.</p>
          </div>
        </section>
      </div>
      <buddj-date-range-picker-drawer></buddj-date-range-picker-drawer>
    `;
    this.appendChild(main);

    main.addEventListener('change', this._onChange);
    main.addEventListener('click', this._onClick);
    main.addEventListener('spending-bucket-select', this._onBucketSelect);
    main.addEventListener('spending-dashboard-change', this._onDashboardChange);
    main.querySelector('form')?.addEventListener('submit', this._onSubmit);
    store.addEventListener('spendingTrackerStateUpdated', this._onStateUpdated);

    const { range, shortcut } = store.getState();
    if (shortcut) {
      this._requestShortcut(shortcut);
    } else if (range) {
      store.emitAction('loadSpendingTracker', { ...range, shortcut: null });
    } else {
      this._requestShortcut(DEFAULT_SHORTCUT);
    }
    this._syncFromStore();
  }

  disconnectedCallback(): void {
    const store = this._store;
    const main = this._main;
    if (main) {
      main.removeEventListener('change', this._onChange);
      main.removeEventListener('click', this._onClick);
      main.removeEventListener('spending-bucket-select', this._onBucketSelect);
      main.removeEventListener('spending-dashboard-change', this._onDashboardChange);
      main.querySelector('form')?.removeEventListener('submit', this._onSubmit);
    }
    if (store) {
      store.removeEventListener('spendingTrackerStateUpdated', this._onStateUpdated);
    }
    this._main = undefined;
  }

  /** Les raccourcis sont recalculés à partir d'aujourd'hui à chaque demande. */
  private _requestShortcut(shortcut: SpendingRangeShortcut): void {
    const range = rangeForShortcut({ shortcut, today: todayIso() });
    this._selectedStart = null;
    this._store?.emitAction('loadSpendingTracker', { ...range, shortcut });
  }

  private _onStateUpdated = (): void => {
    this._syncFromStore();
  };

  private _onSubmit = (e: Event): void => {
    e.preventDefault();
  };

  private _onChange = (e: Event): void => {
    const store = this._store;
    const main = this._main;
    const input = e.target;
    if (!store || !main || !(input instanceof HTMLInputElement)) return;

    if (input.name === 'spending-shortcut') {
      this._requestShortcut(input.value as SpendingRangeShortcut);
      return;
    }

    if (input.name === 'spending-kind') {
      const kinds = { ...store.getState().kinds, [input.value]: input.checked };
      store.emitAction('setSpendingKinds', kinds);
    }
  };

  private _openRangePicker(): void {
    const main = this._main;
    if (!main) return;
    const picker = main.querySelector('buddj-date-range-picker-drawer') as BuddjDateRangePickerDrawerElement;
    picker.open({
      range: this._store?.getState().range ?? null,
      today: todayIso(),
      onValidate: (range) => this._requestRange(range),
    });
  }

  private _requestRange(range: SpendingRange): void {
    this._selectedStart = null;
    this._store?.emitAction('loadSpendingTracker', { ...range, shortcut: null });
  }

  private _onClick = (e: Event): void => {
    if ((e.target as Element).closest('.spending-tracker-range-button')) {
      this._openRangePicker();
      return;
    }
    if ((e.target as Element).closest('.spending-tracker-retry')) {
      this._retry();
      return;
    }
    if ((e.target as Element).closest('.spending-tracker-chart-toggle')) {
      this._isChartOpen = !this._isChartOpen;
      this._syncFromStore();
      return;
    }
    const button = (e.target as Element).closest('.spending-tracker-bar');
    if (!button) return;
    const start = button.hasAttribute('data-period') ? PERIOD_KEY : button.getAttribute('data-start');
    if (!start) return;
    this._selectedStart = this._selectedStart === start ? null : start;
    this._syncFromStore();
  };

  /** Sélection depuis le graphique : affiche le détail de la période. */
  private _onBucketSelect = (e: Event): void => {
    const { start } = (e as CustomEvent<SpendingBucketSelect>).detail;
    this._selectedStart = start;
    this._syncFromStore();
  };

  /** Encart observé : la courbe suit. */
  private _onDashboardChange = (): void => {
    this._syncFromStore();
  };

  /** Relance la dernière plage demandée (raccourci recalculé s'il y en a un). */
  private _retry(): void {
    const store = this._store;
    if (!store) return;
    const { range, shortcut } = store.getState();
    if (shortcut) {
      this._requestShortcut(shortcut);
    } else if (range) {
      store.emitAction('loadSpendingTracker', { ...range, shortcut: null });
    }
  }

  private _syncFromStore(): void {
    const store = this._store;
    const main = this._main;
    if (!store || !main) return;
    const { range, shortcut, kinds, view, isLoading, loadErrorMessage } = store.getState();

    this._syncFilters({ main, range, shortcut, kinds });

    const loadingEl = main.querySelector('.spending-tracker-loading') as HTMLElement;
    const errorEl = main.querySelector('.spending-tracker-error') as HTMLElement;
    loadingEl.hidden = !isLoading;
    errorEl.hidden = !loadErrorMessage || isLoading;

    const showView = view !== null && !loadErrorMessage;
    const filtered = view ? filterSpendingTrackerView({ view, kinds }) : null;
    this._renderDashboard({ main, view: showView ? filtered : null });
    this._renderChart({ main, view: showView ? filtered : null, kinds, isRefreshing: isLoading });
    this._renderBars({ main, view: showView ? filtered : null });
  }

  private _syncFilters({
    main,
    range,
    shortcut,
    kinds,
  }: {
    main: HTMLElement;
    range: { from: string; to: string } | null;
    shortcut: SpendingRangeShortcut | null;
    kinds: Record<TrackedSpendingKind, boolean>;
  }): void {
    main.querySelectorAll<HTMLInputElement>('input[name="spending-shortcut"]').forEach((radio) => {
      radio.checked = radio.value === shortcut;
    });
    const rangeButton = main.querySelector('.spending-tracker-range-button') as HTMLButtonElement;
    const rangeText = rangeButton.querySelector('.spending-tracker-range-text') as HTMLElement;
    const rangeLabel = range ? formatDaySpanLabel(range) : 'Choisir des dates';
    rangeText.textContent = rangeLabel;
    rangeButton.setAttribute('aria-label', `Dates : ${rangeLabel}`);
    rangeButton.classList.toggle('spending-tracker-range-button--custom', range !== null && shortcut === null);
    const checkedCount = Number(kinds.expense) + Number(kinds.outflow);
    main.querySelectorAll<HTMLInputElement>('input[name="spending-kind"]').forEach((checkbox) => {
      const kind = checkbox.value as TrackedSpendingKind;
      checkbox.checked = kinds[kind];
      // Le dernier type coché reste verrouillé : on ne peut pas tout décocher.
      checkbox.disabled = kinds[kind] && checkedCount === 1;
    });
  }

  private _dashboard(main: HTMLElement): BuddjSpendingDashboardElement {
    return main.querySelector('buddj-spending-dashboard') as BuddjSpendingDashboardElement;
  }

  private _renderDashboard({ main, view }: { main: HTMLElement; view: SpendingTrackerView | null }): void {
    const dashboard = this._dashboard(main);
    dashboard.hidden = view === null;
    if (!view) return;
    dashboard.render({
      dashboard: spendingDashboard({ view, today: todayIso() }),
      isChartOpen: this._isChartOpen,
      hasChart: view.total > 0,
    });
  }

  private _renderChart({
    main,
    view,
    kinds,
    isRefreshing,
  }: {
    main: HTMLElement;
    view: SpendingTrackerView | null;
    kinds: Record<TrackedSpendingKind, boolean>;
    isRefreshing: boolean;
  }): void {
    const chart = main.querySelector(BUDDJ_CHART_TAG) as BuddjSpendingTrackerChart;
    const dashboard = this._dashboard(main);
    const hasCurve = view !== null && view.total > 0;
    const isShown = hasCurve && this._isChartOpen;
    chart.hidden = !isShown;
    if (!isShown || !view) return;
    // Une plage d'un seul jour se lit heure par heure.
    const [singleDay] = view.granularity === 'day' && view.buckets.length === 1 ? view.buckets : [];
    const byCategory = dashboard.observed === 'categories';
    const stack = byCategory
      ? categoryStack({ view, hourly: singleDay !== undefined })
      : kindStack({
          points: singleDay ? hourlyCumulativeSpending({ bucket: singleDay }) : cumulativeSpending({ view }),
          kinds,
        });
    chart.render({
      // Une seule série n'a pas de légende : le titre la nomme.
      title: byCategory
        ? stack.series.length === 1
          ? `Cumul : ${stack.series[0]!.label}`
          : 'Cumul par catégorie'
        : 'Cumul sur la période',
      ...stack,
      step: singleDay ? 'hour' : view.granularity,
      selectedKey: this._selectedStart === PERIOD_KEY ? null : this._selectedStart,
      isRefreshing,
    });
  }

  private _renderBars({ main, view }: { main: HTMLElement; view: SpendingTrackerView | null }): void {
    const list = main.querySelector('.spending-tracker-bars') as HTMLOListElement;
    const emptyEl = main.querySelector('.spending-tracker-empty') as HTMLElement;
    if (!view) {
      list.innerHTML = '';
      list.hidden = true;
      emptyEl.hidden = true;
      return;
    }
    const isEmpty = view.total === 0;
    emptyEl.hidden = !isEmpty;
    list.hidden = isEmpty;
    list.setAttribute('aria-label', GRANULARITY_LIST_LABELS[view.granularity]);
    if (isEmpty) {
      list.innerHTML = '';
      return;
    }

    const max = Math.max(...view.buckets.map((b) => b.total));
    // Le récap s'ouvre dans la ligne cliquée, juste sous sa barre.
    const detail = this._selectedDetail({ view });
    const detailHtmlFor = (key: string): string => (detail?.key === key ? this._detailHtml(detail) : '');
    list.innerHTML = this._periodRowHtml({ view, detailHtml: detailHtmlFor(PERIOD_KEY) }) + view.buckets
      .map((bucket) => {
        const label = formatBucketLabel({ start: bucket.start, granularity: view.granularity });
        const amount = formatEuros(bucket.total);
        const selected = bucket.start === this._selectedStart;
        const expenseWidth = max > 0 ? (bucket.expensesTotal / max) * 100 : 0;
        const outflowWidth = max > 0 ? (bucket.outflowsTotal / max) * 100 : 0;
        const disabled = bucket.entries.length === 0 ? ' disabled' : '';
        return `
        <li class="spending-tracker-bar-row">
          <button type="button" class="spending-tracker-bar${selected ? ' spending-tracker-bar--selected' : ''}"
            data-start="${escapeAttr(bucket.start)}" aria-pressed="${selected}"
            aria-label="${escapeAttr(`${label} : ${amount}`)}"${disabled}>
            <span class="spending-tracker-bar-label">${escapeHtml(label)}</span>
            <span class="spending-tracker-bar-track" aria-hidden="true">
              <span class="spending-tracker-bar-fill spending-tracker-bar-fill--expense" style="width:${expenseWidth.toFixed(2)}%"></span>
              <span class="spending-tracker-bar-fill spending-tracker-bar-fill--outflow" style="width:${outflowWidth.toFixed(2)}%"></span>
            </span>
            <span class="spending-tracker-bar-amount">${escapeHtml(amount)}</span>
          </button>${detailHtmlFor(bucket.start)}
        </li>`;
      })
      .join('');
  }

  /** Ligne de synthèse de toute la période, en tête de liste dès qu'il y a plusieurs buckets. */
  private _periodRowHtml({ view, detailHtml }: { view: SpendingTrackerView; detailHtml: string }): string {
    if (view.buckets.length < 2) return '';
    const label = formatRangeLabel({ from: view.from, to: view.to });
    const amount = formatEuros(view.total);
    const expenseWidth = view.total > 0 ? (view.expensesTotal / view.total) * 100 : 0;
    const outflowWidth = view.total > 0 ? (view.outflowsTotal / view.total) * 100 : 0;
    const selected = this._selectedStart === PERIOD_KEY;
    const ariaLabel = `Toute la période, ${label} : ${amount}`;
    return `
        <li class="spending-tracker-bar-row spending-tracker-bar-row--period" aria-label="${escapeAttr(ariaLabel)}">
          <button type="button" class="spending-tracker-bar spending-tracker-bar--period${selected ? ' spending-tracker-bar--selected' : ''}"
            data-period aria-pressed="${selected}" aria-label="${escapeAttr(ariaLabel)}">
            <span class="spending-tracker-bar-label">${escapeHtml(label)}</span>
            <span class="spending-tracker-bar-track" aria-hidden="true">
              <span class="spending-tracker-bar-fill spending-tracker-bar-fill--expense" style="width:${expenseWidth.toFixed(2)}%"></span>
              <span class="spending-tracker-bar-fill spending-tracker-bar-fill--outflow" style="width:${outflowWidth.toFixed(2)}%"></span>
            </span>
            <span class="spending-tracker-bar-amount">${escapeHtml(amount)}</span>
          </button>${detailHtml}
        </li>`;
  }

  private _detailHtml({ label, entries }: SpendingDetail): string {
    const body = `<div class="spending-tracker-days">${groupByDay(entries)
          .map(
            (group) => `
            <section class="spending-tracker-day" aria-label="${escapeAttr(group.label)}">
              <div class="spending-tracker-day-header">
                <h3 class="spending-tracker-day-title">${escapeHtml(group.label)}</h3>
                <span class="spending-tracker-day-total" aria-label="${escapeAttr(`Total du ${group.label} : ${formatEuros(dayTotal(group))}`)}">${escapeHtml(formatEuros(dayTotal(group)))}</span>
              </div>
              ${this._entriesHtml(group)}
            </section>`
          )
          .join('')}
            </div>`;
    return `
          <section class="spending-tracker-detail" aria-label="${escapeAttr(`Détail : ${label}`)}">
            <h2 class="spending-tracker-detail-title">Détail : ${escapeHtml(label)}</h2>
            ${body}
          </section>`;
  }

  private _entriesHtml({ label, entries }: { label: string; entries: TrackedSpendingEntry[] }): string {
    return `
            <ul class="spending-tracker-entries" aria-label="${escapeAttr(`Dépenses : ${label}`)}">
              ${entries
                .map(
                  (entry) => `
              <li class="spending-tracker-entry" aria-label="${escapeAttr(`${entry.label} : ${formatEuros(entry.amount)}`)}">
                <span class="spending-tracker-entry-kind spending-tracker-entry-kind--${entry.kind}">${KIND_LABELS[entry.kind]}</span>
                <span class="spending-tracker-entry-label">${escapeHtml(entry.label)}</span>
                <time class="spending-tracker-entry-time" datetime="${escapeAttr(entry.occurredAt)}">${escapeHtml(timeFormatter.format(new Date(entry.occurredAt)))}</time>
                <span class="spending-tracker-entry-amount">${escapeHtml(formatEuros(entry.amount))}</span>
              </li>`
                )
                .join('')}
            </ul>`;
  }

  /** Dépenses à détailler : toute la période, le bucket sélectionné, ou l'unique bucket d'une plage d'un jour. */
  private _selectedDetail({ view }: { view: SpendingTrackerView }): SpendingDetail | null {
    if (this._selectedStart === PERIOD_KEY) {
      const entries = chronological(view.buckets.flatMap((b) => b.entries));
      if (entries.length === 0) return null;
      return { key: PERIOD_KEY, label: formatRangeLabel({ from: view.from, to: view.to }), entries };
    }
    const nonEmpty = view.buckets.filter((b) => b.entries.length > 0);
    // Une plage d'un seul jour (ou un seul bucket rempli) s'affiche directement.
    const bucket: SpendingBucket | undefined =
      view.buckets.find((b) => b.start === this._selectedStart && b.entries.length > 0) ??
      (view.buckets.length === 1 ? nonEmpty[0] : undefined);
    if (!bucket) return null;
    return {
      key: bucket.start,
      label: formatBucketLabel({ start: bucket.start, granularity: view.granularity }),
      entries: chronological(bucket.entries),
    };
  }
}

customElements.define(BuddjScreenSpendingTracker.tagName, BuddjScreenSpendingTracker);
