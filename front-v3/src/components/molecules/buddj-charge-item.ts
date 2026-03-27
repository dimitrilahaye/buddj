/**
 * Une ligne de charge récurrente (toggle taken = prélevé du compte, libellé, montant, supprimer).
 * Même vocabulaire et logique que les dépenses (taken). Utilise buddj-line-item.
 * Attribut amount : nombre (buddj-line-item formate en « X € »).
 */
import type { BuddjConfirmModalElement } from './buddj-confirm-modal.js';
import { getToast } from '../atoms/buddj-toast.js';

const CHECKBOX_ID_PREFIX = 'buddj-charge-cb-';

export class BuddjChargeItem extends HTMLElement {
  static readonly tagName = 'buddj-charge-item';

  connectedCallback(): void {
    if (this.querySelector('buddj-line-item')) return;
    const icon = this.getAttribute('icon') ?? '💰';
    const label = this.getAttribute('label') ?? 'Loyer';
    const amountNum = parseFloat(this.getAttribute('amount') ?? '0') || 0;
    const taken = this.hasAttribute('taken') ? this.getAttribute('taken') !== 'false' : false;
    const previous = this.hasAttribute('previous');
    const noLabelToggle = this.hasAttribute('no-label-toggle');
    const cbId = CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11);

    this.classList.add('charge-item');
    if (previous) this.classList.add('charge-item--previous');

    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', icon);
    lineItem.setAttribute('label', label);
    lineItem.setAttribute('amount', String(amountNum));
    if (!noLabelToggle) lineItem.setAttribute('checkable-for', cbId);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = cbId;
    checkbox.className = 'charge-taken';
    checkbox.title = 'Marquer comme prélevé du compte (ne compte plus dans le solde)';
    checkbox.checked = taken;
    checkbox.slot = 'prefix';

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';

    lineItem.appendChild(checkbox);
    lineItem.appendChild(deleteBtn);
    this.appendChild(lineItem);

    this.attachToggleListener();
    this.attachDeleteListener(label);
  }

  private attachToggleListener(): void {
    const checkbox = this.querySelector<HTMLInputElement>('.charge-taken');
    checkbox?.addEventListener('change', () => {
      if (checkbox.checked) this.setAttribute('taken', '');
      else this.removeAttribute('taken');
      this.dispatchEvent(
        new CustomEvent('buddj-charge-taken-change', {
          bubbles: true,
          detail: {
            outflowId: this.getAttribute('outflow-id') ?? '',
            isChecked: checkbox.checked,
          },
        }),
      );
    });
  }

  private attachDeleteListener(chargeLabel: string): void {
    this.addEventListener('click', (e) => {
      if (!(e.target as Element).closest('buddj-icon-delete')) return;
      e.preventDefault();
      const label = this.getAttribute('label') ?? chargeLabel;
      const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
      modal?.show({
        title: `Voulez-vous vraiment supprimer la charge "${label}" ?`,
        onConfirm: () => {
          const toast = getToast();
          toast?.show({ message: 'La charge a bien été supprimée' });
        },
        onCancel: () => {},
      });
    });
  }
}

customElements.define(BuddjChargeItem.tagName, BuddjChargeItem);
