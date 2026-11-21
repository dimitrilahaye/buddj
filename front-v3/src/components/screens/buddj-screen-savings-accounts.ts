/**
 * Onglet « Épargnes » : un compte épargne à la fois (flèches ← → pour passer de l'un à l'autre),
 * son solde et la liste de ses opérations par jour, comme sur une appli bancaire.
 * Ajout, modification et suppression d'opérations ; le solde est recalculé par le back.
 * Hors cycle de vie des mois et hors recherches.
 */
import {
  getCurrentSavingsAccount,
  type SavingsAccountsStore,
  type SavingsOperationFailed,
  type SavingsOperationSaved,
} from '../../application/savings-account/savings-accounts-store.js';
import type { SavingsAccountView, SavingsOperation } from '../../application/savings-account/savings-account-types.js';
import { todayIso } from '../../application/spending-tracker/spending-tracker-range.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import '../organisms/buddj-savings-account-switcher.js';
import type { BuddjSavingsAccountSwitcher } from '../organisms/buddj-savings-account-switcher.js';
import '../organisms/buddj-savings-operation-drawer.js';
import {
  formatOperationDay,
  type BuddjSavingsOperationDrawerElement,
} from '../organisms/buddj-savings-operation-drawer.js';
import { createLineActionsMenu } from '../../shared/line-actions-menu.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

const DEFAULT_LABELS = { deposit: 'Ajout', withdrawal: 'Retrait' } as const;

const SAVED_MESSAGES: Record<SavingsOperationSaved['action'], string> = {
  add: 'Opération ajoutée',
  update: 'Opération modifiée',
  delete: 'Opération supprimée',
};

const FAILED_MESSAGES: Record<SavingsOperationFailed['action'], string> = {
  add: 'Impossible d’ajouter l’opération',
  update: 'Impossible de modifier l’opération',
  delete: 'Impossible de supprimer l’opération',
};

export function operationLabel(operation: SavingsOperation): string {
  return operation.label ?? DEFAULT_LABELS[operation.type];
}

export function signedEuros(operation: SavingsOperation): string {
  return `${operation.type === 'deposit' ? '+' : '−'} ${formatEuros(operation.amount)}`;
}

type OperationDay = { date: string; operations: SavingsOperation[] };

/** Opérations déjà triées de la plus récente à la plus ancienne, regroupées par jour. */
function groupByDay(operations: SavingsOperation[]): OperationDay[] {
  const days: OperationDay[] = [];
  for (const operation of operations) {
    const last = days.at(-1);
    if (last?.date === operation.date) last.operations.push(operation);
    else days.push({ date: operation.date, operations: [operation] });
  }
  return days;
}

export class BuddjScreenSavingsAccounts extends HTMLElement {
  static readonly tagName = 'buddj-screen-savings-accounts';

  private _store?: SavingsAccountsStore;
  private _main?: HTMLElement;

  init({ savingsAccountsStore }: { savingsAccountsStore: SavingsAccountsStore }): void {
    this._store = savingsAccountsStore;
  }

  connectedCallback(): void {
    const store = this._store;
    if (!store || this._main) return;

    const main = document.createElement('main');
    this._main = main;
    main.id = 'savings-accounts';
    main.className = 'screen screen--savings-accounts';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap savings-accounts-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Épargnes</h1>
        </header>
        <buddj-savings-account-switcher hidden></buddj-savings-account-switcher>
      </div>
      <div class="savings-accounts-content">
        <p class="savings-accounts-loading" hidden>Chargement des comptes épargne…</p>
        <div class="savings-accounts-error" role="alert" hidden>
          <p>Impossible d’afficher tes comptes épargne pour le moment. Vérifie ta connexion puis réessaie.</p>
          <button type="button" class="btn savings-accounts-retry">Réessayer</button>
        </div>
        <p class="savings-accounts-none" hidden>Aucun compte épargne pour le moment.</p>
        <section class="savings-account-operations" aria-label="Opérations" hidden>
          <button type="button" class="btn savings-account-add">+ Ajouter une opération</button>
          <div class="savings-account-days"></div>
          <div class="savings-account-empty" hidden>
            <p class="savings-account-empty-title">Aucune opération sur ce compte.</p>
            <p class="savings-account-empty-hint">Commence par un ajout du montant actuel de ton épargne.</p>
          </div>
        </section>
      </div>
      <buddj-savings-operation-drawer></buddj-savings-operation-drawer>
    `;
    this.appendChild(main);

    main.addEventListener('click', this._onClick);
    main.addEventListener('savings-account-previous', this._onPrevious);
    main.addEventListener('savings-account-next', this._onNext);
    main.addEventListener('buddj-dropdown-action', this._onDropdownAction as EventListener);
    store.addEventListener('savingsAccountsStateUpdated', this._onStateUpdated);
    store.addEventListener('savingsOperationSaved', this._onSaved as EventListener);
    store.addEventListener('savingsOperationFailed', this._onFailed as EventListener);

    store.emitAction('loadSavingsAccounts');
    this._render();
  }

  disconnectedCallback(): void {
    const store = this._store;
    const main = this._main;
    if (main) {
      main.removeEventListener('click', this._onClick);
      main.removeEventListener('savings-account-previous', this._onPrevious);
      main.removeEventListener('savings-account-next', this._onNext);
      main.removeEventListener('buddj-dropdown-action', this._onDropdownAction as EventListener);
      main.remove();
    }
    if (store) {
      store.removeEventListener('savingsAccountsStateUpdated', this._onStateUpdated);
      store.removeEventListener('savingsOperationSaved', this._onSaved as EventListener);
      store.removeEventListener('savingsOperationFailed', this._onFailed as EventListener);
    }
    this._main = undefined;
  }

  private _current(): SavingsAccountView | null {
    return this._store ? getCurrentSavingsAccount({ state: this._store.getState() }) : null;
  }

  private _drawer(): BuddjSavingsOperationDrawerElement {
    return this._main!.querySelector('buddj-savings-operation-drawer') as BuddjSavingsOperationDrawerElement;
  }

  private _onStateUpdated = (): void => this._render();

  private _onPrevious = (): void => this._store?.emitAction('goToPreviousSavingsAccount');

  private _onNext = (): void => this._store?.emitAction('goToNextSavingsAccount');

  private _onSaved = (e: CustomEvent<SavingsOperationSaved>): void => {
    getToast()?.show({ message: SAVED_MESSAGES[e.detail.action], variant: 'success' });
  };

  private _onFailed = (e: CustomEvent<SavingsOperationFailed>): void => {
    getToast()?.show({ message: FAILED_MESSAGES[e.detail.action], variant: 'error' });
  };

  private _onClick = (e: Event): void => {
    const target = e.target as Element;
    if (target.closest('.savings-accounts-retry')) {
      this._store?.emitAction('loadSavingsAccounts');
      return;
    }
    if (target.closest('.savings-account-add')) this._openAdd();
  };

  private _onDropdownAction = (e: CustomEvent<{ actionId: string; targetId: string }>): void => {
    const { actionId, targetId } = e.detail;
    const operation = this._current()?.operations.find((o) => o.id === targetId);
    if (!operation) return;
    e.stopPropagation();
    if (actionId === 'edit') this._openEdit(operation);
    else if (actionId === 'delete') this._confirmDelete(operation);
  };

  private _openAdd(): void {
    const account = this._current();
    if (!account) return;
    this._drawer().open({
      title: 'Ajouter une opération',
      today: todayIso(),
      onValidate: (operation) =>
        this._store?.emitAction('addSavingsOperation', { savingsAccountId: account.id, operation }),
    });
  }

  private _openEdit(operation: SavingsOperation): void {
    const account = this._current();
    if (!account) return;
    this._drawer().open({
      title: 'Modifier l’opération',
      initial: { type: operation.type, amount: operation.amount, label: operation.label, date: operation.date },
      today: todayIso(),
      onValidate: (edited) =>
        this._store?.emitAction('updateSavingsOperation', {
          savingsAccountId: account.id,
          operationId: operation.id,
          operation: edited,
        }),
    });
  }

  private _confirmDelete(operation: SavingsOperation): void {
    const account = this._current();
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement | null;
    if (!account || !modal) return;
    modal.show({
      title: `Supprimer l’opération « ${operationLabel(operation)} » ?`,
      description: `${signedEuros(operation)} le ${formatOperationDay(operation.date)}. Le solde du compte sera recalculé.`,
      confirmLabel: 'Supprimer',
      onConfirm: () =>
        this._store?.emitAction('deleteSavingsOperation', { savingsAccountId: account.id, operationId: operation.id }),
      onCancel: () => {},
    });
  }

  private _render(): void {
    const store = this._store;
    const main = this._main;
    if (!store || !main) return;
    const state = store.getState();
    const { accounts, currentIndex, isLoading, loadErrorMessage } = state;
    const account = getCurrentSavingsAccount({ state });

    (main.querySelector('.savings-accounts-loading') as HTMLElement).hidden = !(isLoading && accounts === null);
    (main.querySelector('.savings-accounts-error') as HTMLElement).hidden = !loadErrorMessage || isLoading;
    (main.querySelector('.savings-accounts-none') as HTMLElement).hidden = !(accounts && accounts.length === 0);

    const switcher = main.querySelector('buddj-savings-account-switcher') as BuddjSavingsAccountSwitcher;
    const section = main.querySelector('.savings-account-operations') as HTMLElement;
    switcher.hidden = account === null;
    section.hidden = account === null;
    if (!account || !accounts) return;

    switcher.render({
      name: account.name,
      amount: account.amount,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < accounts.length - 1,
    });
    section.setAttribute('aria-label', `Opérations : ${account.name}`);
    (main.querySelector('.savings-account-empty') as HTMLElement).hidden = account.operations.length > 0;
    this._renderOperations({ main, account });
  }

  private _renderOperations({ main, account }: { main: HTMLElement; account: SavingsAccountView }): void {
    const container = main.querySelector('.savings-account-days') as HTMLElement;
    container.innerHTML = groupByDay(account.operations)
      .map(
        (day) => `
        <section class="savings-account-day" aria-label="${escapeAttr(formatOperationDay(day.date))}">
          <h3 class="savings-account-day-title">${escapeHtml(formatOperationDay(day.date))}</h3>
          <ul class="savings-account-day-list">
            ${day.operations
              .map(
                (operation) => `
            <li class="savings-operation savings-operation--${operation.type}" data-operation-id="${escapeAttr(operation.id)}"
              aria-label="${escapeAttr(`${operationLabel(operation)} : ${signedEuros(operation)}`)}">
              <span class="savings-operation-icon" aria-hidden="true">${operation.type === 'deposit' ? '↑' : '↓'}</span>
              <span class="savings-operation-text">
                <span class="savings-operation-label">${escapeHtml(operationLabel(operation))}</span>
                ${operation.label ? `<span class="savings-operation-type">${DEFAULT_LABELS[operation.type]}</span>` : ''}
              </span>
              <span class="savings-operation-amount">${escapeHtml(signedEuros(operation))}</span>
            </li>`
              )
              .join('')}
          </ul>
        </section>`
      )
      .join('');
    container.querySelectorAll<HTMLElement>('.savings-operation').forEach((row) => {
      const operation = account.operations.find((o) => o.id === row.dataset.operationId);
      if (!operation) return;
      const menu = createLineActionsMenu({ subject: `l’opération « ${operationLabel(operation)} »` });
      menu.removeAttribute('slot');
      menu.setAttribute('target-id', operation.id);
      row.appendChild(menu);
    });
  }
}

customElements.define(BuddjScreenSavingsAccounts.tagName, BuddjScreenSavingsAccounts);
