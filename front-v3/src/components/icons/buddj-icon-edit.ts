/**
 * Bouton icône « Modifier » (crayon). Réutilisable partout (solde, nom de budget, etc.).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconEdit extends HTMLElement {
  static readonly tagName = 'buddj-icon-edit';

  static get observedAttributes(): string[] {
    return ['title', 'aria-label'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const title = this.getAttribute('title') ?? 'Modifier';
    const label = this.getAttribute('aria-label') ?? title;
    this.innerHTML = `
      <button type="button" class="btn btn--icon btn--edit" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}">
        <span aria-hidden="true">✏️</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconEdit.tagName, BuddjIconEdit);
