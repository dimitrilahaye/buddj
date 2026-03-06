/**
 * Bouton icône « Ajouter » (+). Réutilisable (économies, remboursements, etc.).
 */
import { escapeAttr } from '../../shared/escape.js';

export class BuddjIconAdd extends HTMLElement {
  static readonly tagName = 'buddj-icon-add';

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
    const title = this.getAttribute('title') ?? 'Ajouter';
    const label = this.getAttribute('aria-label') ?? title;
    const disabled = this.hasAttribute('disabled');
    this.innerHTML = `
      <button type="button" class="btn btn--icon" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}" ${disabled ? ' disabled' : ''}>
        <span aria-hidden="true">+</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconAdd.tagName, BuddjIconAdd);
