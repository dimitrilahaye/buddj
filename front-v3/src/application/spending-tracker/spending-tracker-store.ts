import { Store } from '../store.js';
import type { LoadSpendingTrackerUseCase } from './load-spending-tracker.js';
import { isValidRange } from './spending-tracker-range.js';
import type {
  SpendingKindsFilter,
  SpendingRange,
  SpendingRangeShortcut,
  SpendingTrackerView,
} from './spending-tracker-types.js';

export type SpendingTrackerState = {
  /** Plage demandée (null tant que l'écran n'a rien demandé). */
  range: SpendingRange | null;
  /** Raccourci actif, null si la plage vient des date-pickers. */
  shortcut: SpendingRangeShortcut | null;
  kinds: SpendingKindsFilter;
  view: SpendingTrackerView | null;
  isLoading: boolean;
  loadErrorMessage: string | null;
};

const DEFAULT_STATE: SpendingTrackerState = {
  range: null,
  shortcut: null,
  kinds: { expense: true, outflow: true },
  view: null,
  isLoading: false,
  loadErrorMessage: null,
};

export type LoadSpendingTracker = SpendingRange & { shortcut: SpendingRangeShortcut | null };

export type SpendingTrackerLoadFailed = { message: string };

export class SpendingTrackerStore extends Store<SpendingTrackerState> {
  private readonly _loadSpendingTracker: LoadSpendingTrackerUseCase;
  /** Seule la dernière requête lancée met à jour l'état (changements de dates rapides). */
  private _lastRequestId = 0;

  constructor({ loadSpendingTracker }: { loadSpendingTracker: LoadSpendingTrackerUseCase }) {
    super(DEFAULT_STATE);
    this._loadSpendingTracker = loadSpendingTracker;

    this.addEventListener('loadSpendingTracker', (e: Event) => {
      const d = (e as CustomEvent<LoadSpendingTracker>).detail;
      if (d && isValidRange(d)) void this.handleLoad(d);
    });
    this.addEventListener('setSpendingKinds', (e: Event) => {
      const kinds = (e as CustomEvent<SpendingKindsFilter>).detail;
      if (kinds) this.handleSetKinds(kinds);
    });
  }

  private _notify(): void {
    this.emitStateChange('spendingTrackerStateUpdated');
  }

  private async handleLoad({ from, to, shortcut }: LoadSpendingTracker): Promise<void> {
    const requestId = ++this._lastRequestId;
    this.setState({ range: { from, to }, shortcut, isLoading: true, loadErrorMessage: null });
    this.emitStateChange('spendingTrackerLoading');
    this._notify();
    try {
      const view = await this._loadSpendingTracker({ from, to });
      if (requestId !== this._lastRequestId) return;
      this.setState({ view, isLoading: false });
      this.emitStateChange('spendingTrackerLoaded');
    } catch (err) {
      if (requestId !== this._lastRequestId) return;
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
      this.emitStateChange<SpendingTrackerLoadFailed>('spendingTrackerLoadFailed', { message });
    }
    this._notify();
  }

  /** Au moins un type reste coché. */
  private handleSetKinds(kinds: SpendingKindsFilter): void {
    if (!kinds.expense && !kinds.outflow) return;
    this.setState({ kinds: { expense: kinds.expense, outflow: kinds.outflow } });
    this.emitStateChange('spendingKindsChanged');
    this._notify();
  }
}
