/**
 * Écran « Accéder aux mois archivés » : liste depuis GET /months/archived,
 * désarchivage (PUT …/unarchive) et suppression définitive (DELETE /months/:id).
 */
import type { ArchivedMonthStore } from '../../application/month/archived-month-store.js';
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr } from '../../shared/escape.js';

export class BuddjScreenArchived extends HTMLElement {
  static readonly tagName = 'buddj-screen-archived';

  private _archivedStore?: ArchivedMonthStore;
  private _main?: HTMLElement;

  init({ archivedMonthStore }: { archivedMonthStore: ArchivedMonthStore }): void {
    this._archivedStore = archivedMonthStore;
  }

  connectedCallback(): void {
    if (this.querySelector('#archived')) return;
    const store = this._archivedStore;
    if (!store) return;

    const main = document.createElement('main');
    this._main = main;
    main.id = 'archived';
    main.className = 'screen screen--archived';
    main.innerHTML = `
      <div class="screen-sticky-header-wrap archived-sticky-wrap">
        <header class="screen-header">
          <h1 class="title">Mois archivés</h1>
        </header>
      </div>
      <section class="archived-section" aria-label="Liste des mois archivés">
        <p class="archived-loading" hidden>Chargement des mois archivés…</p>
        <p class="archived-error" role="alert" hidden></p>
        <ul class="archived-list"></ul>
        <p class="archived-empty" hidden>Aucun mois archivé.</p>
      </section>
    `;
    this.appendChild(main);

    main.addEventListener('click', this._onMainClick);

    store.addEventListener('archivedStateUpdated', this._onArchivedStateUpdated);
    store.addEventListener('archivedMonthUnarchived', this._onUnarchivedToast);
    store.addEventListener('archivedMonthDeleted', this._onDeletedToast);
    store.addEventListener('archivedMonthUnarchiveFailed', this._onMutationErrorToast);
    store.addEventListener('archivedMonthDeleteFailed', this._onMutationErrorToast);
    store.addEventListener('archivedMonthsLoadFailed', this._onLoadErrorToast);

    this._syncFromStore();
    store.emitAction('loadArchivedMonths');
  }

  disconnectedCallback(): void {
    const store = this._archivedStore;
    const main = this._main;
    if (main) {
      main.removeEventListener('click', this._onMainClick);
    }
    if (store) {
      store.removeEventListener('archivedStateUpdated', this._onArchivedStateUpdated);
      store.removeEventListener('archivedMonthUnarchived', this._onUnarchivedToast);
      store.removeEventListener('archivedMonthDeleted', this._onDeletedToast);
      store.removeEventListener('archivedMonthUnarchiveFailed', this._onMutationErrorToast);
      store.removeEventListener('archivedMonthDeleteFailed', this._onMutationErrorToast);
      store.removeEventListener('archivedMonthsLoadFailed', this._onLoadErrorToast);
    }
    this._main = undefined;
  }

  private _onArchivedStateUpdated = (): void => {
    this._syncFromStore();
  };

  private _onUnarchivedToast = (): void => {
    getToast()?.show({ message: 'Le mois a bien été désarchivé' });
  };

  private _onDeletedToast = (): void => {
    getToast()?.show({ message: 'Le mois a bien été supprimé' });
  };

  private _onMutationErrorToast = ((e: Event) => {
    const d = (e as CustomEvent<{ message?: string }>).detail;
    const message = d?.message ?? 'Une erreur est survenue';
    getToast()?.show({ message, variant: 'error', durationMs: 3500 });
  }) as EventListener;

  private _onLoadErrorToast = ((e: Event) => {
    const d = (e as CustomEvent<{ message?: string }>).detail;
    const message = d?.message ?? 'Impossible de charger les mois archivés';
    getToast()?.show({ message, variant: 'error', durationMs: 3500 });
  }) as EventListener;

  private _onMainClick = (e: Event): void => {
    const store = this._archivedStore;
    if (!store) return;
    if (store.getState().busyMonthId) return;
    const target = e.target as Element;
    const deleteBtn = target.closest('buddj-icon-delete');
    const unarchiveBtn = target.closest('.archived-btn-unarchive');
    const row = (deleteBtn ?? unarchiveBtn)?.closest('.archived-row');
    if (!row) return;

    const monthId = row.getAttribute('data-id') ?? '';
    const label = row.getAttribute('data-label') ?? '';
    if (!monthId) return;

    if (deleteBtn) {
      e.preventDefault();
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment supprimer définitivement le mois ${label} ?`,
        onConfirm: () => {
          store.emitAction('deleteArchivedMonth', { monthId });
        },
        onCancel: () => {},
      });
      return;
    }

    if (unarchiveBtn) {
      e.preventDefault();
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment désarchiver le mois ${label} ?`,
        onConfirm: () => {
          store.emitAction('unarchiveMonth', { monthId });
        },
        onCancel: () => {},
      });
    }
  };

  private _syncFromStore(): void {
    const store = this._archivedStore;
    const main = this._main;
    if (!store || !main) return;

    const { months, isLoading, loadErrorMessage, busyMonthId } = store.getState();
    const list = main.querySelector('.archived-list');
    const emptyEl = main.querySelector('.archived-empty');
    const loadingEl = main.querySelector('.archived-loading');
    const errorEl = main.querySelector('.archived-error');

    if (loadingEl instanceof HTMLElement) {
      loadingEl.hidden = !isLoading;
    }
    if (errorEl instanceof HTMLElement) {
      const showErr = Boolean(loadErrorMessage) && !isLoading;
      errorEl.hidden = !showErr;
      errorEl.textContent = loadErrorMessage ?? '';
    }
    if (emptyEl instanceof HTMLElement) {
      emptyEl.hidden = isLoading || Boolean(loadErrorMessage) || months.length > 0;
    }

    if (list) {
      const listHtml = months
        .map((m) => {
          const busy = busyMonthId === m.id;
          const disabledAttr = busy ? ' disabled' : '';
          return `
      <li class="archived-row" data-id="${escapeAttr(m.id)}" data-label="${escapeAttr(m.displayLabel)}" aria-label="${escapeAttr(m.displayLabel)}">
        <buddj-line-item class="archived-line-item" icon="📁" label="${escapeAttr(m.displayLabel)}" hide-amount no-inner-padding>
          <div class="archived-row-actions" slot="actions">
            <button type="button" class="btn archived-btn-unarchive"${disabledAttr}>Désarchiver</button>
            <buddj-icon-delete title="Supprimer définitivement ce mois"></buddj-icon-delete>
          </div>
        </buddj-line-item>
      </li>`;
        })
        .join('');
      list.innerHTML = listHtml;
    }
  }
}

customElements.define(BuddjScreenArchived.tagName, BuddjScreenArchived);
