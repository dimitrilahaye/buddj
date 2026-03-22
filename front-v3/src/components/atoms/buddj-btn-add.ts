/**
 * Bouton « Ajouter » réutilisable (coral) : texte + « + », ou `label=""` pour n’afficher que le « + » (même style).
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
    const iconOnly = label.trim() === '';
    const compactClass = iconOnly ? ' btn--add--icon-only' : '';

    this.innerHTML = `
    <button type="button" class="btn btn--add${compactClass}" title="${escapeAttr(title)}" aria-label="${escapeAttr(title)}">
      <span class="btn-icon" aria-hidden="true">+</span>
      ${iconOnly ? '' : escapeHtml(label)}
    </button>
  `;
  }
}

customElements.define(BuddjBtnAdd.tagName, BuddjBtnAdd);
