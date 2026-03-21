import { Store } from '../store.js';
import { DEFAULT_MONTH_STATE, getCurrentMonth, type MonthState } from './month-state.js';
import type { LoadUnarchivedMonthsFn } from './load-unarchived-months.js';
import type { MonthView } from './month-view.js';

export class MonthStore extends Store<MonthState> {
  constructor({ loadUnarchivedMonths }: { loadUnarchivedMonths: LoadUnarchivedMonthsFn }) {
    super(DEFAULT_MONTH_STATE);
    this._loadUnarchivedMonths = loadUnarchivedMonths;
    this.addEventListener('loadUnarchivedMonths', () => void this.handleLoadUnarchivedMonths());
    this.addEventListener('goToPreviousMonth', () => this.handleGoToPreviousMonth());
    this.addEventListener('goToNextMonth', () => this.handleGoToNextMonth());
  }

  private _loadUnarchivedMonths: LoadUnarchivedMonthsFn;

  private async handleLoadUnarchivedMonths(): Promise<void> {
    await this._loadUnarchivedMonths({ store: this });
  }

  private handleGoToPreviousMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months.length === 0) return;
    const next = Math.max(0, currentIndex - 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  private handleGoToNextMonth(): void {
    const { months, currentIndex } = this.getState();
    if (months.length === 0) return;
    const next = Math.min(months.length - 1, currentIndex + 1);
    if (next === currentIndex) return;
    this.setState({ currentIndex: next });
    this.emitCurrentMonthChanged();
  }

  /** Notifie les WC (barre récap, écran budgets) après changement du mois courant. */
  emitCurrentMonthChanged(): void {
    const month = getCurrentMonth({ state: this.getState() });
    if (!month) {
      this.emitStateChange('currentMonthChanged', { month: null as MonthView | null });
      return;
    }
    this.emitStateChange('currentMonthChanged', { month });
  }

  getCurrentMonthIdForNav(): string {
    return getCurrentMonth({ state: this.getState() })?.id ?? '';
  }
}
