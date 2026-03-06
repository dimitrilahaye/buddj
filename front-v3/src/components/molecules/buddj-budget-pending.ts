/**
 * Mention « X dépense(s) en attente » ou « Aucune dépense en attente ». Attribut count (nombre).
 */
import { escapeHtml } from '../../shared/escape.js';

export class BuddjBudgetPending extends HTMLElement {
  static readonly tagName = 'buddj-budget-pending';

  static get observedAttributes(): string[] {
    return ['count'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const count = parseInt(this.getAttribute('count') ?? '0', 10);
    const text =
      count <= 0
        ? "Aucune dépense en attente"
        : count === 1
          ? "1 dépense en attente"
          : `${count} dépenses en attente`;
    this.innerHTML = `<p class="budget-pending">${escapeHtml(text)}</p>`;
  }
}

customElements.define(BuddjBudgetPending.tagName, BuddjBudgetPending);
