/**
 * Écran « Accéder aux mois archivés » : liste des mois archivés avec actions supprimer et désarchiver.
 * Modales de confirmation + toasts de succès ; pas de logique réelle de suppression/désarchivage.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr } from '../../shared/escape.js';

const ARCHIVED_MONTHS = [
  { id: '2024-01', label: 'Janvier 2024' },
  { id: '2024-02', label: 'Février 2024' },
  { id: '2023-12', label: 'Décembre 2023' },
];

export class BuddjScreenArchived extends HTMLElement {
  static readonly tagName = 'buddj-screen-archived';

  connectedCallback(): void {
    if (this.querySelector('.archived-list')) return;
    const main = document.createElement('main');
    main.id = 'archived';
    main.className = 'screen screen--archived';
    const listHtml = ARCHIVED_MONTHS.map(
      (m) => `
      <li class="archived-row" data-id="${escapeAttr(m.id)}" data-label="${escapeAttr(m.label)}">
        <buddj-line-item class="archived-line-item" icon="📁" label="${escapeAttr(m.label)}" amount="" no-inner-padding>
          <div class="archived-row-actions" slot="actions">
            <button type="button" class="btn archived-btn-unarchive">Désarchiver</button>
            <buddj-icon-delete title="Supprimer définitivement ce mois"></buddj-icon-delete>
          </div>
        </buddj-line-item>
      </li>`
    ).join('');
    main.innerHTML = `
      <header class="screen-header">
        <h1 class="title">Mois archivés</h1>
      </header>
      <section class="archived-section">
        <ul class="archived-list" aria-label="Liste des mois archivés">
          ${listHtml}
        </ul>
        ${ARCHIVED_MONTHS.length === 0 ? '<p class="archived-empty">Aucun mois archivé.</p>' : ''}
      </section>
    `;
    this.appendChild(main);
    this.attachListeners();
  }

  private attachListeners(): void {
    const list = this.querySelector('.archived-list');
    if (!list) return;

    list.addEventListener('click', (e) => {
      const target = e.target as Element;
      const deleteBtn = target.closest('buddj-icon-delete');
      const unarchiveBtn = target.closest('.archived-btn-unarchive');
      const row = (deleteBtn ?? unarchiveBtn)?.closest('.archived-row');
      if (!row) return;

      const label = row.getAttribute('data-label') ?? '';

      if (deleteBtn) {
        e.preventDefault();
        const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
        modal?.show({
          title: `Voulez-vous vraiment supprimer définitivement le mois ${label} ?`,
          onConfirm: () => {
            const toast = getToast();
            toast?.show({ message: 'Le mois a bien été supprimé' });
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
            const toast = getToast();
            toast?.show({ message: 'Le mois a bien été désarchivé' });
          },
          onCancel: () => {},
        });
      }
    });
  }
}

customElements.define(BuddjScreenArchived.tagName, BuddjScreenArchived);
