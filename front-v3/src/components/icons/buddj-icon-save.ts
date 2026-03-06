/**
 * Bouton icône « Enregistrer / Valider » (✓). Utilisé en mode édition (ex. solde).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconSave extends HTMLElement {
  static readonly tagName = 'buddj-icon-save';

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
    const title = this.getAttribute('title') ?? 'Enregistrer';
    const label = this.getAttribute('aria-label') ?? title;
    this.innerHTML = `
      <button type="button" class="btn btn--icon btn--save" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}">
        <span aria-hidden="true">✓</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconSave.tagName, BuddjIconSave);
