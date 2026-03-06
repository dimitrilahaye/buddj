/**
 * Carte budget simplifiée pour les templates : nom, icône, montant alloué, suppression uniquement.
 * Pas de dépenses, pas de remaining, pas de pending, pas de toggle.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import { getToast } from '../atoms/buddj-toast.js';

export class BuddjTemplateBudgetCard extends HTMLElement {
  static readonly tagName = 'buddj-template-budget-card';

  connectedCallback(): void {
    if (this.querySelector('buddj-line-item')) return;
    const icon = this.getAttribute('icon') ?? '💰';
    const name = this.getAttribute('name') ?? 'Budget';
    const allocated = this.getAttribute('allocated') ?? '0';

    this.classList.add('template-budget-card');

    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', icon);
    lineItem.setAttribute('label', name);
    lineItem.setAttribute('amount', allocated);

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';

    lineItem.appendChild(deleteBtn);
    this.appendChild(lineItem);

    this.attachDeleteListener(name);
  }

  private attachDeleteListener(budgetName: string): void {
    this.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('buddj-icon-delete')) return;
      e.preventDefault();
      const name = this.getAttribute('name') ?? budgetName;
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment supprimer le budget "${name}" ?`,
        onConfirm: () => {
          const toast = getToast();
          toast?.show({ message: 'Le budget a bien été supprimé' });
          this.dispatchEvent(new CustomEvent('buddj-budget-deleted', { bubbles: true }));
        },
        onCancel: () => {},
      });
    });
  }
}

customElements.define(BuddjTemplateBudgetCard.tagName, BuddjTemplateBudgetCard);
