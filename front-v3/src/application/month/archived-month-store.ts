import { Store } from '../store.js';
import type { DeleteArchivedMonthUseCase } from './delete-archived-month.js';
import type { LoadArchivedMonthsUseCase } from './load-archived-months.js';
import type { MonthStore } from './month-store.js';
import type { MonthView } from './month-view.js';
import type { UnarchiveMonthUseCase } from './unarchive-month.js';

export type ArchivedMonthState = {
  months: MonthView[];
  isLoading: boolean;
  loadErrorMessage: string | null;
  busyMonthId: string | null;
};

const DEFAULT_ARCHIVED_MONTH_STATE: ArchivedMonthState = {
  months: [],
  isLoading: false,
  loadErrorMessage: null,
  busyMonthId: null,
};

export type UnarchiveMonthActionDetail = { monthId: string };
export type DeleteArchivedMonthActionDetail = { monthId: string };

/**
 * Liste des mois archivés (GET /months/archived) et mutations désarchivage / suppression définitive.
 */
export class ArchivedMonthStore extends Store<ArchivedMonthState> {
  constructor({
    loadArchivedMonths,
    unarchiveMonth,
    deleteArchivedMonth,
    monthStore,
  }: {
    loadArchivedMonths: LoadArchivedMonthsUseCase;
    unarchiveMonth: UnarchiveMonthUseCase;
    deleteArchivedMonth: DeleteArchivedMonthUseCase;
    monthStore: MonthStore;
  }) {
    super(DEFAULT_ARCHIVED_MONTH_STATE);
    this._loadArchivedMonths = loadArchivedMonths;
    this._unarchiveMonth = unarchiveMonth;
    this._deleteArchivedMonth = deleteArchivedMonth;
    this._monthStore = monthStore;
    this.addEventListener('loadArchivedMonths', () => void this.handleLoadArchivedMonths());
    this.addEventListener('unarchiveMonth', (e: Event) => {
      const d = (e as CustomEvent<UnarchiveMonthActionDetail>).detail;
      if (d?.monthId) void this.handleUnarchiveMonth(d.monthId);
    });
    this.addEventListener('deleteArchivedMonth', (e: Event) => {
      const d = (e as CustomEvent<DeleteArchivedMonthActionDetail>).detail;
      if (d?.monthId) void this.handleDeleteArchivedMonth(d.monthId);
    });
  }

  private _loadArchivedMonths: LoadArchivedMonthsUseCase;
  private _unarchiveMonth: UnarchiveMonthUseCase;
  private _deleteArchivedMonth: DeleteArchivedMonthUseCase;
  private _monthStore: MonthStore;

  private _notify(): void {
    this.emitStateChange('archivedStateUpdated');
  }

  private async handleLoadArchivedMonths(): Promise<void> {
    if (this.getState().isLoading) return;
    this.setState({ isLoading: true, loadErrorMessage: null });
    this.emitStateChange('archivedMonthsLoading');
    this._notify();
    try {
      const months = await this._loadArchivedMonths();
      this.setState({ months, isLoading: false, loadErrorMessage: null });
      this.emitStateChange('archivedMonthsLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
      this.emitStateChange('archivedMonthsLoadFailed', { message });
    }
    this._notify();
  }

  private async handleUnarchiveMonth(monthId: string): Promise<void> {
    if (this.getState().busyMonthId) return;
    this.setState({ busyMonthId: monthId });
    this.emitStateChange('archivedMonthUnarchiveLoading', { monthId });
    this._notify();
    try {
      const unarchived = await this._unarchiveMonth({ monthId });
      this._monthStore.emitAction('applyUnarchivedMonthsFromApi', {
        months: unarchived,
        preferredMonthId: monthId,
      });
      this.setState({
        months: this.getState().months.filter((m) => m.id !== monthId),
        busyMonthId: null,
      });
      this.emitStateChange('archivedMonthUnarchived', { monthId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ busyMonthId: null });
      this.emitStateChange('archivedMonthUnarchiveFailed', { message });
    }
    this._notify();
  }

  private async handleDeleteArchivedMonth(monthId: string): Promise<void> {
    if (this.getState().busyMonthId) return;
    this.setState({ busyMonthId: monthId });
    this.emitStateChange('archivedMonthDeleteLoading', { monthId });
    this._notify();
    try {
      const remaining = await this._deleteArchivedMonth({ monthId });
      this.setState({ months: remaining, busyMonthId: null });
      this.emitStateChange('archivedMonthDeleted', { monthId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ busyMonthId: null });
      this.emitStateChange('archivedMonthDeleteFailed', { message });
    }
    this._notify();
  }
}
