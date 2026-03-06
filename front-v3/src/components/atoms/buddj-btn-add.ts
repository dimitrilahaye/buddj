/**
 * Bouton « Ajouter » réutilisable : avec label (coral, texte + icône) ou icône seule (sans label, style menthe).
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

export class BuddjBtnAdd extends HTMLElement {
  static readonly tagName = 'buddj-btn-add';

  static get observedAttributes(): string[] {
    return ['label', 'title'];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    if (this.innerHTML) this.render();
  }

  private render(): void {
    const label = this.getAttribute('label') ?? '';
    const title = this.getAttribute('title') ?? 'Ajouter';

    this.innerHTML = `
    <button type="button" class="btn btn--add" title="${escapeAttr(title)}" aria-label="${escapeAttr(title)}">
      <span class="btn-icon" aria-hidden="true">+</span>
      ${escapeHtml(label)}
    </button>
  `;
  }
}

customElements.define(BuddjBtnAdd.tagName, BuddjBtnAdd);
