/**
 * Une ligne de charge récurrente (toggle taken = prélevé du compte, libellé, montant, supprimer).
 * Même vocabulaire et logique que les dépenses (taken). Utilise buddj-line-item.
 * Attribut amount : nombre (buddj-line-item formate en « X € »).
 */
import type { BuddjConfirmModalElement } from './buddj-confirm-modal.js';

import {
  PROJECTED_SIMULATION_INCLUDE_ATTR,
  PROJECTED_SIMULATION_ROW_ID_ATTR,
} from '../../shared/projected-simulation.js';

const CHECKBOX_ID_PREFIX = 'buddj-charge-cb-';
const SIMULATION_CHECKBOX_ID_PREFIX = 'buddj-charge-sim-cb-';

export class BuddjChargeItem extends HTMLElement {
  static readonly tagName = 'buddj-charge-item';

  connectedCallback(): void {
    if (this.querySelector('buddj-line-item')) return;
    const icon = this.getAttribute('icon') ?? '💰';
    const label = this.getAttribute('label') ?? 'Loyer';
    const amountNum = parseFloat(this.getAttribute('amount') ?? '0') || 0;
    const taken = this.hasAttribute('taken') ? this.getAttribute('taken') !== 'false' : false;
    const previous = this.hasAttribute('previous');
    const projectedSimulation = this.hasAttribute('projected-simulation');
    const noLabelToggle = this.hasAttribute('no-label-toggle');
    const hideTaken = this.hasAttribute('hide-taken');
    const cbId = projectedSimulation
      ? SIMULATION_CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11)
      : CHECKBOX_ID_PREFIX + Math.random().toString(36).slice(2, 11);

    this.classList.add('charge-item');
    if (previous) this.classList.add('charge-item--previous');

    const lineItem = document.createElement('buddj-line-item');
    lineItem.setAttribute('icon', icon);
    lineItem.setAttribute('label', label);
    lineItem.setAttribute('amount', String(amountNum));
    if (projectedSimulation) {
      lineItem.setAttribute('checkable-for', cbId);
    } else if (!noLabelToggle && !hideTaken) {
      lineItem.setAttribute('checkable-for', cbId);
    }

    const deleteBtn = document.createElement('buddj-icon-delete');
    deleteBtn.setAttribute('title', 'Supprimer');
    deleteBtn.slot = 'actions';

    if (projectedSimulation) {
      const rowId = this.getAttribute('outflow-id') ?? '';
      const included = this.getAttribute('simulation-included') !== 'false';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = cbId;
      checkbox.className = 'charge-taken';
      checkbox.setAttribute(PROJECTED_SIMULATION_INCLUDE_ATTR, 'charge');
      checkbox.setAttribute(PROJECTED_SIMULATION_ROW_ID_ATTR, rowId);
      checkbox.title = 'Exclure du total projeté';
      checkbox.setAttribute('aria-label', 'Exclure du total projeté');
      checkbox.checked = !included;
      checkbox.slot = 'prefix';
      lineItem.appendChild(checkbox);
    } else if (!hideTaken) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = cbId;
      checkbox.className = 'charge-taken';
      checkbox.title = 'Marquer comme prélevé du compte (ne compte plus dans le solde)';
      checkbox.checked = taken;
      checkbox.slot = 'prefix';
      lineItem.appendChild(checkbox);
    }

    lineItem.appendChild(deleteBtn);
    this.appendChild(lineItem);

    if (projectedSimulation) this.attachProjectedSimulationListener();
    else if (!hideTaken) this.attachToggleListener();
    this.attachDeleteListener(label);
  }

  private attachProjectedSimulationListener(): void {
    const checkbox = this.querySelector<HTMLInputElement>(
      `input[${PROJECTED_SIMULATION_INCLUDE_ATTR}="charge"]`,
    );
    checkbox?.addEventListener('change', () => {
      const included = !checkbox.checked;
      if (included) this.setAttribute('simulation-included', '');
      else this.setAttribute('simulation-included', 'false');
      this.dispatchEvent(
        new CustomEvent('buddj-projected-simulation-change', {
          bubbles: true,
          composed: true,
          detail: {
            kind: 'charge' as const,
            rowId: this.getAttribute('outflow-id') ?? '',
            included,
          },
        }),
      );
    });
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
          const outflowId = this.getAttribute('outflow-id') ?? '';
          if (outflowId) {
            this.dispatchEvent(
              new CustomEvent('buddj-charge-delete-confirmed', {
                bubbles: true,
                composed: true,
                detail: { outflowId },
              }),
            );
          }
        },
        onCancel: () => {},
      });
    });
  }
}

customElements.define(BuddjChargeItem.tagName, BuddjChargeItem);
