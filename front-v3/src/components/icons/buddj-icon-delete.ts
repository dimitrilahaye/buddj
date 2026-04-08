/**
 * Bouton icône « Supprimer » (×). Réutilisable (charge, dépense, budget, etc.).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconDelete extends HTMLElement {
  static readonly tagName = 'buddj-icon-delete';

  static get observedAttributes(): string[] {
    return ['title', 'aria-label', 'disabled'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const title = this.getAttribute('title') ?? 'Supprimer';
    const label = this.getAttribute('aria-label') ?? title;
    const disabled = this.hasAttribute('disabled');
    const disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';
    const disabledClass = disabled ? ' btn--delete--disabled' : '';
    this.innerHTML = `
      <button type="button" class="btn btn--icon btn--delete${disabledClass}" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}"${disabledAttr}>
        <span aria-hidden="true">×</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconDelete.tagName, BuddjIconDelete);
