import { Store } from '../store.js';
import type {
  AddSavingsOperationUseCase,
  DeleteSavingsOperationUseCase,
  LoadSavingsAccountsUseCase,
  UpdateSavingsOperationUseCase,
} from './savings-account-use-cases.js';
import type { SavingsAccountView, SavingsOperationInput } from './savings-account-types.js';

export type SavingsAccountsState = {
  /** null tant que rien n'est chargé */
  accounts: SavingsAccountView[] | null;
  /** Compte affiché (index dans `accounts`) */
  currentIndex: number;
  isLoading: boolean;
  loadErrorMessage: string | null;
};

const DEFAULT_STATE: SavingsAccountsState = {
  accounts: null,
  currentIndex: 0,
  isLoading: false,
  loadErrorMessage: null,
};

export type AddSavingsOperation = { savingsAccountId: string; operation: SavingsOperationInput };
export type UpdateSavingsOperation = AddSavingsOperation & { operationId: string };
export type DeleteSavingsOperation = { savingsAccountId: string; operationId: string };

/** Échec d'une écriture : `action` permet au WC d'afficher un message adapté. */
export type SavingsOperationFailed = { action: 'add' | 'update' | 'delete'; message: string };
export type SavingsOperationSaved = { action: 'add' | 'update' | 'delete' };

export function getCurrentSavingsAccount({ state }: { state: SavingsAccountsState }): SavingsAccountView | null {
  return state.accounts?.[state.currentIndex] ?? null;
}

/**
 * Comptes épargne et leurs opérations. Hors cycle de vie des mois : rien ici ne dépend du MonthStore.
 * Un seul event d'état, `savingsAccountsStateUpdated`, plus les retours d'écriture.
 */
export class SavingsAccountsStore extends Store<SavingsAccountsState> {
  private readonly _loadSavingsAccounts: LoadSavingsAccountsUseCase;
  private readonly _addSavingsOperation: AddSavingsOperationUseCase;
  private readonly _updateSavingsOperation: UpdateSavingsOperationUseCase;
  private readonly _deleteSavingsOperation: DeleteSavingsOperationUseCase;

  constructor({
    loadSavingsAccounts,
    addSavingsOperation,
    updateSavingsOperation,
    deleteSavingsOperation,
  }: {
    loadSavingsAccounts: LoadSavingsAccountsUseCase;
    addSavingsOperation: AddSavingsOperationUseCase;
    updateSavingsOperation: UpdateSavingsOperationUseCase;
    deleteSavingsOperation: DeleteSavingsOperationUseCase;
  }) {
    super(DEFAULT_STATE);
    this._loadSavingsAccounts = loadSavingsAccounts;
    this._addSavingsOperation = addSavingsOperation;
    this._updateSavingsOperation = updateSavingsOperation;
    this._deleteSavingsOperation = deleteSavingsOperation;

    this.addEventListener('loadSavingsAccounts', () => void this.handleLoad());
    this.addEventListener('goToPreviousSavingsAccount', () => this.handleMove({ step: -1 }));
    this.addEventListener('goToNextSavingsAccount', () => this.handleMove({ step: 1 }));
    this.addEventListener('addSavingsOperation', (e: Event) => {
      const d = (e as CustomEvent<AddSavingsOperation>).detail;
      if (d) void this.handleWrite({ action: 'add', run: () => this._addSavingsOperation(d) });
    });
    this.addEventListener('updateSavingsOperation', (e: Event) => {
      const d = (e as CustomEvent<UpdateSavingsOperation>).detail;
      if (d) void this.handleWrite({ action: 'update', run: () => this._updateSavingsOperation(d) });
    });
    this.addEventListener('deleteSavingsOperation', (e: Event) => {
      const d = (e as CustomEvent<DeleteSavingsOperation>).detail;
      if (d) void this.handleWrite({ action: 'delete', run: () => this._deleteSavingsOperation(d) });
    });
  }

  private _notify(): void {
    this.emitStateChange('savingsAccountsStateUpdated');
  }

  private async handleLoad(): Promise<void> {
    this.setState({ isLoading: true, loadErrorMessage: null });
    this._notify();
    try {
      const accounts = await this._loadSavingsAccounts();
      const currentIndex = Math.min(this.state.currentIndex, Math.max(accounts.length - 1, 0));
      this.setState({ accounts, currentIndex, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
    }
    this._notify();
  }

  private handleMove({ step }: { step: number }): void {
    const count = this.state.accounts?.length ?? 0;
    const next = this.state.currentIndex + step;
    if (next < 0 || next >= count) return;
    this.setState({ currentIndex: next });
    this._notify();
  }

  /** Le back renvoie le compte à jour (solde recalculé) : on le remplace tel quel. */
  private async handleWrite({
    action,
    run,
  }: {
    action: SavingsOperationFailed['action'];
    run: () => Promise<SavingsAccountView>;
  }): Promise<void> {
    try {
      const updated = await run();
      const accounts = (this.state.accounts ?? []).map((a) => (a.id === updated.id ? updated : a));
      this.setState({ accounts });
      this.emitStateChange<SavingsOperationSaved>('savingsOperationSaved', { action });
      this._notify();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange<SavingsOperationFailed>('savingsOperationFailed', { action, message });
    }
  }
}
