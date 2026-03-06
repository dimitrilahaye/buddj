/**
 * Bouton icône « Transférer » (↗). Variant "out" = style or (sortie de budget), sinon style menthe (vers un budget).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconTransfer extends HTMLElement {
  static readonly tagName = 'buddj-icon-transfer';

  static get observedAttributes(): string[] {
    return ['title', 'aria-label', 'variant'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const title = this.getAttribute('title') ?? 'Transférer';
    const label = this.getAttribute('aria-label') ?? title;
    const variant = this.getAttribute('variant');
    const btnClass = variant === 'out' ? 'btn btn--icon btn--transfer-out' : 'btn btn--icon btn--transfer';
    this.innerHTML = `
      <button type="button" class="${btnClass}" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}">
        <span aria-hidden="true">↗</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconTransfer.tagName, BuddjIconTransfer);
