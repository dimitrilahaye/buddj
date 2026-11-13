/**
 * Écran « Suivi des dépenses » : dépenses hebdo et sorties ajoutées au fil de l'eau,
 * regroupées par jour, semaine ou mois (GET /spending-tracker).
 * Raccourcis (aujourd'hui, cette semaine, ce mois) ou plage libre via date-pickers ;
 * filtre par type côté front, sans rechargement.
 */
import type { SpendingTrackerStore } from '../../application/spending-tracker/spending-tracker-store.js';
import { filterSpendingTrackerView } from '../../application/spending-tracker/spending-tracker-filter.js';
import {
  isCalendarDay,
  rangeForShortcut,
  todayIso,
} from '../../application/spending-tracker/spending-tracker-range.js';
import type {
  SpendingBucket,
  SpendingGranularity,
  SpendingRangeShortcut,
  SpendingTrackerView,
  TrackedSpendingKind,
} from '../../application/spending-tracker/spending-tracker-types.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

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

const dayFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const weekFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const timeFormatter = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Libellé d'un bucket : « lun. 2 nov. », « semaine du 2 nov. », « novembre 2026 ». */
export function formatBucketLabel({
  start,
  granularity,
}: {
  start: string;
  granularity: SpendingGranularity;
}): string {
  const date = new Date(`${start}T00:00:00Z`);
  if (granularity === 'week') return `semaine du ${weekFormatter.format(date)}`;
  if (granularity === 'month') return monthFormatter.format(date);
  return dayFormatter.format(date);
}

export class BuddjScreenSpendingTracker extends HTMLElement {
  static readonly tagName = 'buddj-screen-spending-tracker';

  private _store?: SpendingTrackerStore;
  private _main?: HTMLElement;
  /** Bucket dont le détail est affiché (start), null si aucun. */
  private _selectedStart: string | null = null;

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
          <div class="spending-tracker-dates">
            <label class="spending-tracker-date">
              <span>Du</span>
              <input type="date" name="spending-from" required>
            </label>
            <label class="spending-tracker-date">
              <span>Au</span>
              <input type="date" name="spending-to" required>
            </label>
          </div>
          <p class="spending-tracker-range-error" role="alert" hidden></p>
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
          <div class="spending-tracker-summary" role="status" aria-label="Total de la période" hidden></div>
          <ol class="spending-tracker-bars"></ol>
          <div class="spending-tracker-empty" hidden>
            <p class="spending-tracker-empty-title">Aucune dépense sur cette période.</p>
            <p class="spending-tracker-empty-hint">Les dépenses et sorties que tu ajoutes à un mois apparaissent ici au fil de l’eau.</p>
          </div>
          <section class="spending-tracker-detail" hidden></section>
        </section>
      </div>
    `;
    this.appendChild(main);

    main.addEventListener('change', this._onChange);
    main.addEventListener('click', this._onClick);
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

    if (input.name === 'spending-from' || input.name === 'spending-to') {
      this._onDatesChanged();
      return;
    }

    if (input.name === 'spending-kind') {
      const kinds = { ...store.getState().kinds, [input.value]: input.checked };
      store.emitAction('setSpendingKinds', kinds);
    }
  };

  private _onDatesChanged(): void {
    const store = this._store;
    const main = this._main;
    if (!store || !main) return;
    const from = (main.querySelector('input[name="spending-from"]') as HTMLInputElement).value;
    const to = (main.querySelector('input[name="spending-to"]') as HTMLInputElement).value;
    main.querySelectorAll<HTMLInputElement>('input[name="spending-shortcut"]').forEach((radio) => {
      radio.checked = false;
    });

    const errorEl = main.querySelector('.spending-tracker-range-error') as HTMLElement;
    if (!isCalendarDay(from) || !isCalendarDay(to)) {
      errorEl.hidden = true;
      return;
    }
    if (from > to) {
      errorEl.textContent = 'La date de début doit précéder la date de fin.';
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;
    this._selectedStart = null;
    store.emitAction('loadSpendingTracker', { from, to, shortcut: null });
  }

  private _onClick = (e: Event): void => {
    if ((e.target as Element).closest('.spending-tracker-retry')) {
      this._retry();
      return;
    }
    const button = (e.target as Element).closest('.spending-tracker-bar');
    if (!button) return;
    const start = button.getAttribute('data-start');
    if (!start) return;
    this._selectedStart = this._selectedStart === start ? null : start;
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
    this._renderSummary({ main, view: showView ? filtered : null });
    this._renderBars({ main, view: showView ? filtered : null });
    this._renderDetail({ main, view: showView ? filtered : null });
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
    const fromInput = main.querySelector('input[name="spending-from"]') as HTMLInputElement;
    const toInput = main.querySelector('input[name="spending-to"]') as HTMLInputElement;
    if (range) {
      fromInput.value = range.from;
      toInput.value = range.to;
    }
    const checkedCount = Number(kinds.expense) + Number(kinds.outflow);
    main.querySelectorAll<HTMLInputElement>('input[name="spending-kind"]').forEach((checkbox) => {
      const kind = checkbox.value as TrackedSpendingKind;
      checkbox.checked = kinds[kind];
      // Le dernier type coché reste verrouillé : on ne peut pas tout décocher.
      checkbox.disabled = kinds[kind] && checkedCount === 1;
    });
  }

  private _renderSummary({ main, view }: { main: HTMLElement; view: SpendingTrackerView | null }): void {
    const summary = main.querySelector('.spending-tracker-summary') as HTMLElement;
    summary.hidden = view === null;
    if (!view) return;
    summary.innerHTML = `
      <p class="spending-tracker-total">${escapeHtml(formatEuros(view.total))}</p>
      <p class="spending-tracker-split">
        <span class="spending-tracker-split-item spending-tracker-split-item--expense">Dépenses ${escapeHtml(formatEuros(view.expensesTotal))}</span>
        <span class="spending-tracker-split-item spending-tracker-split-item--outflow">Sorties ${escapeHtml(formatEuros(view.outflowsTotal))}</span>
      </p>
    `;
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
    list.innerHTML = view.buckets
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
          </button>
        </li>`;
      })
      .join('');
  }

  private _renderDetail({ main, view }: { main: HTMLElement; view: SpendingTrackerView | null }): void {
    const detail = main.querySelector('.spending-tracker-detail') as HTMLElement;
    const nonEmpty = view?.buckets.filter((b) => b.entries.length > 0) ?? [];
    // Une plage d'un seul jour (ou un seul bucket rempli) s'affiche directement.
    const bucket: SpendingBucket | undefined =
      view?.buckets.find((b) => b.start === this._selectedStart && b.entries.length > 0) ??
      (view && view.buckets.length === 1 ? nonEmpty[0] : undefined);
    if (!view || !bucket) {
      detail.hidden = true;
      detail.innerHTML = '';
      return;
    }
    const label = formatBucketLabel({ start: bucket.start, granularity: view.granularity });
    const formatTime = view.granularity === 'day' ? timeFormatter : dateTimeFormatter;
    detail.hidden = false;
    detail.setAttribute('aria-label', `Détail : ${label}`);
    detail.innerHTML = `
      <h2 class="spending-tracker-detail-title">Détail : ${escapeHtml(label)}</h2>
      <ul class="spending-tracker-entries" aria-label="${escapeAttr(`Dépenses : ${label}`)}">
        ${bucket.entries
          .map(
            (entry) => `
        <li class="spending-tracker-entry" aria-label="${escapeAttr(`${entry.label} : ${formatEuros(entry.amount)}`)}">
          <span class="spending-tracker-entry-kind spending-tracker-entry-kind--${entry.kind}">${KIND_LABELS[entry.kind]}</span>
          <span class="spending-tracker-entry-label">${escapeHtml(entry.label)}</span>
          <time class="spending-tracker-entry-time" datetime="${escapeAttr(entry.occurredAt)}">${escapeHtml(formatTime.format(new Date(entry.occurredAt)))}</time>
          <span class="spending-tracker-entry-amount">${escapeHtml(formatEuros(entry.amount))}</span>
        </li>`
          )
          .join('')}
      </ul>
    `;
  }
}

customElements.define(BuddjScreenSpendingTracker.tagName, BuddjScreenSpendingTracker);
