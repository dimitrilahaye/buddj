import { Store } from '../store.js';
import { isValidRange } from '../spending-tracker/spending-tracker-range.js';
import type { SpendingRange, SpendingRangeShortcut } from '../spending-tracker/spending-tracker-types.js';
import type { LoadSavingsTrackerUseCase } from './savings-account-use-cases.js';
import type { SavingsTrackerView } from './savings-account-types.js';

export type SavingsTrackerState = {
  range: SpendingRange | null;
  /** Raccourci actif, null si la plage vient du calendrier */
  shortcut: SpendingRangeShortcut | null;
  savingsAccountId: string | null;
  view: SavingsTrackerView | null;
  isLoading: boolean;
  loadErrorMessage: string | null;
};

const DEFAULT_STATE: SavingsTrackerState = {
  range: null,
  shortcut: null,
  savingsAccountId: null,
  view: null,
  isLoading: false,
  loadErrorMessage: null,
};

export type LoadSavingsTracker = SpendingRange & {
  savingsAccountId: string;
  shortcut: SpendingRangeShortcut | null;
};

/** Suivi des épargnes : calqué sur SpendingTrackerStore, pour un compte donné. */
export class SavingsTrackerStore extends Store<SavingsTrackerState> {
  private readonly _loadSavingsTracker: LoadSavingsTrackerUseCase;
  /** Seule la dernière requête lancée met à jour l'état. */
  private _lastRequestId = 0;

  constructor({ loadSavingsTracker }: { loadSavingsTracker: LoadSavingsTrackerUseCase }) {
    super(DEFAULT_STATE);
    this._loadSavingsTracker = loadSavingsTracker;
    this.addEventListener('loadSavingsTracker', (e: Event) => {
      const d = (e as CustomEvent<LoadSavingsTracker>).detail;
      if (d && d.savingsAccountId && isValidRange(d)) void this.handleLoad(d);
    });
  }

  private _notify(): void {
    this.emitStateChange('savingsTrackerStateUpdated');
  }

  private async handleLoad({ from, to, shortcut, savingsAccountId }: LoadSavingsTracker): Promise<void> {
    const requestId = ++this._lastRequestId;
    // Changer de compte n'affiche pas les chiffres de l'ancien pendant le chargement.
    const view = this.state.savingsAccountId === savingsAccountId ? this.state.view : null;
    this.setState({ range: { from, to }, shortcut, savingsAccountId, view, isLoading: true, loadErrorMessage: null });
    this._notify();
    try {
      const loaded = await this._loadSavingsTracker({ savingsAccountId, from, to });
      if (requestId !== this._lastRequestId) return;
      this.setState({ view: loaded, isLoading: false });
    } catch (err) {
      if (requestId !== this._lastRequestId) return;
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
    }
    this._notify();
  }
}
