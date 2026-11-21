/**
 * Drawer calendrier pour choisir une période d'un seul geste, à la Airbnb :
 * clic sur le début, clic sur la fin, Valider. Valider sans fin = ce seul jour.
 * Aujourd'hui est mis en évidence ; passé et futur sont sélectionnables.
 * En mode `day`, un seul jour se choisit (date d'une opération d'épargne).
 */
import {
  EMPTY_SELECTION,
  addMonths,
  dayStatus,
  monthGrid,
  monthOf,
  pickDay,
  rangeFromSelection,
  selectionFromRange,
  type DateRangeSelection,
} from '../../application/spending-tracker/date-range-selection.js';
import type { SpendingRange } from '../../application/spending-tracker/spending-tracker-types.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const WEEKDAYS = [
  { short: 'L', long: 'lundi' },
  { short: 'M', long: 'mardi' },
  { short: 'M', long: 'mercredi' },
  { short: 'J', long: 'jeudi' },
  { short: 'V', long: 'vendredi' },
  { short: 'S', long: 'samedi' },
  { short: 'D', long: 'dimanche' },
];

const monthTitleFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayNameFormatter = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortDayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' });

function dateOf(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

export type DateRangePickerMode = 'range' | 'day';

export interface DateRangePickerOpenOptions {
  range: SpendingRange | null;
  today: string;
  onValidate: (range: SpendingRange) => void;
  /** `day` : un seul jour, `onValidate` reçoit `from === to`. Par défaut `range`. */
  mode?: DateRangePickerMode;
}

export type BuddjDateRangePickerDrawerElement = HTMLElement & {
  open: (o: DateRangePickerOpenOptions) => void;
  close: () => void;
};

export class BuddjDateRangePickerDrawer extends HTMLElement {
  static readonly tagName = 'buddj-date-range-picker-drawer';

  private _selection: DateRangeSelection = EMPTY_SELECTION;
  private _month = '';
  private _today = '';
  private _onValidate: ((range: SpendingRange) => void) | null = null;
  private _returnFocus: HTMLElement | null = null;
  private _mode: DateRangePickerMode = 'range';

  connectedCallback(): void {
    this.addEventListener('click', this._onClick);
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._onClick);
    this.removeEventListener('keydown', this._onKeyDown);
  }

  open({ range, today, onValidate, mode = 'range' }: DateRangePickerOpenOptions): void {
    this._mode = mode;
    this._selection = range ? selectionFromRange(range) : EMPTY_SELECTION;
    this._today = today;
    this._month = monthOf({ day: range?.to ?? today });
    this._onValidate = onValidate;
    this._returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this._renderShell();
    this.render();
    this.classList.add('date-range-picker-drawer--open');
    this.querySelector<HTMLElement>('.date-range-picker-validate')?.focus();
  }

  close(): void {
    this.classList.remove('date-range-picker-drawer--open');
    this.innerHTML = '';
    this._returnFocus?.focus();
    this._returnFocus = null;
  }

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    if (target.closest('[data-date-range-backdrop], .date-range-picker-cancel')) {
      this.close();
      return;
    }
    if (target.closest('.date-range-picker-validate')) {
      this._validate();
      return;
    }
    const nav = target.closest<HTMLButtonElement>('[data-month-step]');
    if (nav && !nav.disabled) {
      this._month = addMonths({ month: this._month, months: Number(nav.dataset.monthStep) });
      this.render();
      return;
    }
    const dayButton = target.closest<HTMLButtonElement>('[data-day]');
    if (dayButton && !dayButton.disabled && dayButton.dataset.day) {
      this._selection =
        this._mode === 'day'
          ? { start: dayButton.dataset.day, end: null }
          : pickDay({ selection: this._selection, day: dayButton.dataset.day });
      this.render();
      this.querySelector<HTMLElement>(`[data-day="${dayButton.dataset.day}"]`)?.focus();
    }
  };

  private _validate(): void {
    const range = rangeFromSelection(this._selection);
    if (!range) return;
    const onValidate = this._onValidate;
    this.close();
    onValidate?.(range);
  }

  private _hint(): string {
    const { start, end } = this._selection;
    if (this._mode === 'day') {
      return start === null ? 'Choisis une date.' : `Le ${dayNameFormatter.format(dateOf(start))}.`;
    }
    if (start === null) return 'Choisis la date de début.';
    if (end === null) {
      return `Début le ${shortDayFormatter.format(dateOf(start))}. Choisis la date de fin, ou valide pour ce seul jour.`;
    }
    return `Du ${shortDayFormatter.format(dateOf(start))} au ${shortDayFormatter.format(dateOf(end))}.`;
  }

  /** Panneau stable (dialog, consigne, pied) ; seul le calendrier est redessiné. */
  private _renderShell(): void {
    const title = this._mode === 'day' ? 'Choisir une date' : 'Choisir une période';
    this.innerHTML = `
      <div class="date-range-picker-backdrop" data-date-range-backdrop></div>
      <div class="date-range-picker-panel" role="dialog" aria-modal="true" aria-label="${title}">
        <h2 class="date-range-picker-title">${title}</h2>
        <p class="date-range-picker-hint" role="status"></p>
        <div class="date-range-picker-calendar"></div>
        <div class="date-range-picker-footer">
          <button type="button" class="btn date-range-picker-cancel">Annuler</button>
          <button type="button" class="btn date-range-picker-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private render(): void {
    const monthTitle = monthTitleFormatter.format(dateOf(`${this._month}-01`));
    const weeks = monthGrid({ month: this._month });

    (this.querySelector('.date-range-picker-hint') as HTMLElement).textContent = this._hint();
    (this.querySelector('.date-range-picker-validate') as HTMLButtonElement).disabled = this._selection.start === null;
    (this.querySelector('.date-range-picker-calendar') as HTMLElement).innerHTML = `
        <div class="date-range-picker-month">
          <button type="button" class="date-range-picker-nav" data-month-step="-1" aria-label="Mois précédent">‹</button>
          <h3 class="date-range-picker-month-title" aria-live="polite">${escapeHtml(monthTitle)}</h3>
          <button type="button" class="date-range-picker-nav" data-month-step="1" aria-label="Mois suivant">›</button>
        </div>
        <table class="date-range-picker-grid" aria-label="${escapeAttr(monthTitle)}">
          <thead>
            <tr>${WEEKDAYS.map((w) => `<th scope="col" abbr="${w.long}">${w.short}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${weeks.map((week) => `<tr>${week.map((day) => this._dayCellHtml(day)).join('')}</tr>`).join('')}
          </tbody>
        </table>
    `;
  }

  private _dayCellHtml(day: string | null): string {
    if (day === null) return '<td></td>';
    const status = dayStatus({ selection: this._selection, day });
    const selected = status === 'start' || status === 'end' || status === 'single';
    const isToday = day === this._today;
    const classes = [
      'date-range-picker-day',
      `date-range-picker-day--${status}`,
      isToday ? 'date-range-picker-day--today' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `
      <td class="date-range-picker-cell date-range-picker-cell--${status}">
        <button type="button" class="${classes}" data-day="${escapeAttr(day)}"
          aria-label="${escapeAttr(dayNameFormatter.format(dateOf(day)))}" aria-pressed="${selected}"${isToday ? ' aria-current="date"' : ''}>${Number(day.slice(8))}</button>
      </td>`;
  }
}

customElements.define(BuddjDateRangePickerDrawer.tagName, BuddjDateRangePickerDrawer);
