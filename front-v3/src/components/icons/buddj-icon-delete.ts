/**
 * Bouton icône « Supprimer » (×). Réutilisable (charge, dépense, budget, etc.).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconDelete extends HTMLElement {
  static readonly tagName = 'buddj-icon-delete';

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
    const title = this.getAttribute('title') ?? 'Supprimer';
    const label = this.getAttribute('aria-label') ?? title;
    this.innerHTML = `
      <button type="button" class="btn btn--icon btn--delete" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}">
        <span aria-hidden="true">×</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconDelete.tagName, BuddjIconDelete);
