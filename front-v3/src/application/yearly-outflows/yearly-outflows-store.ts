import { Store } from '../store.js';
import type { AddYearlySavingUseCase } from './add-yearly-saving.js';
import { createEmptyYearlyOutflowsView } from './yearly-outflows-view.js';
import type { LoadYearlyOutflowsUseCase } from './load-yearly-outflows.js';
import type { RemoveYearlySavingUseCase } from './remove-yearly-saving.js';
import type { YearlyOutflowsView } from './yearly-outflows-view.js';

export type YearlyOutflowsState = {
  view: YearlyOutflowsView;
  isLoading: boolean;
  loadErrorMessage: string | null;
  busy: boolean;
};

const DEFAULT_STATE: YearlyOutflowsState = {
  view: createEmptyYearlyOutflowsView(),
  isLoading: false,
  loadErrorMessage: null,
  busy: false,
};

export type AddYearlySavingActionDetail = {
  kind: 'outflow' | 'budget';
  month: number;
  label: string;
  amount: number;
};

export type RemoveYearlySavingActionDetail = { id: string };

export class YearlyOutflowsStore extends Store<YearlyOutflowsState> {
  constructor({
    loadYearlyOutflows,
    addYearlySaving,
    removeYearlySaving,
  }: {
    loadYearlyOutflows: LoadYearlyOutflowsUseCase;
    addYearlySaving: AddYearlySavingUseCase;
    removeYearlySaving: RemoveYearlySavingUseCase;
  }) {
    super(DEFAULT_STATE);
    this._loadYearlyOutflows = loadYearlyOutflows;
    this._addYearlySaving = addYearlySaving;
    this._removeYearlySaving = removeYearlySaving;

    this.addEventListener('loadYearlyOutflows', () => void this.handleLoad());
    this.addEventListener('addYearlySaving', (e: Event) => {
      const d = (e as CustomEvent<AddYearlySavingActionDetail>).detail;
      if (
        d &&
        (d.kind === 'outflow' || d.kind === 'budget') &&
        d.month >= 1 &&
        d.month <= 12 &&
        d.label?.trim() &&
        d.amount > 0
      ) {
        void this.handleAdd(d);
      }
    });
    this.addEventListener('removeYearlySaving', (e: Event) => {
      const d = (e as CustomEvent<RemoveYearlySavingActionDetail>).detail;
      if (d?.id) void this.handleRemove(d);
    });
  }

  private _loadYearlyOutflows: LoadYearlyOutflowsUseCase;
  private _addYearlySaving: AddYearlySavingUseCase;
  private _removeYearlySaving: RemoveYearlySavingUseCase;

  private _notify(): void {
    this.emitStateChange('yearlyOutflowsStateUpdated');
  }

  private async handleLoad(): Promise<void> {
    if (this.getState().isLoading) return;
    this.setState({ isLoading: true, loadErrorMessage: null });
    this.emitStateChange('yearlyOutflowsLoading');
    this._notify();
    try {
      const view = await this._loadYearlyOutflows();
      this.setState({ view, isLoading: false, loadErrorMessage: null });
      this.emitStateChange('yearlyOutflowsLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
      this.emitStateChange('yearlyOutflowsLoadFailed', { message });
    }
    this._notify();
  }

  private async handleAdd(detail: AddYearlySavingActionDetail): Promise<void> {
    if (this.getState().busy) return;
    this.setState({ busy: true });
    this.emitStateChange('yearlySavingAddLoading');
    this._notify();
    try {
      const view = await this._addYearlySaving({
        kind: detail.kind,
        month: detail.month,
        label: detail.label.trim(),
        amount: detail.amount,
      });
      this.setState({ view });
      this.emitStateChange('yearlySavingAddLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('yearlySavingAddFailed', { message });
    } finally {
      this.setState({ busy: false });
      this._notify();
    }
  }

  private async handleRemove(detail: RemoveYearlySavingActionDetail): Promise<void> {
    if (this.getState().busy) return;
    this.setState({ busy: true });
    this.emitStateChange('yearlySavingRemoveLoading');
    this._notify();
    try {
      const view = await this._removeYearlySaving({ id: detail.id });
      this.setState({ view });
      this.emitStateChange('yearlySavingRemoveLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('yearlySavingRemoveFailed', { message });
    } finally {
      this.setState({ busy: false });
      this._notify();
    }
  }
}
