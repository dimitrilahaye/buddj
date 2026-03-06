/**
 * Bouton icône « Recherche » (loupe). Utilisé pour ouvrir le drawer de recherche des charges.
 */
import { escapeAttr } from '../../shared/escape.js';

const LOUPE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;

export class BuddjIconSearch extends HTMLElement {
  static readonly tagName = 'buddj-icon-search';

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
    const title = this.getAttribute('title') ?? 'Rechercher';
    const label = this.getAttribute('aria-label') ?? title;
    this.innerHTML = `
      <button type="button" class="btn btn--icon btn--search" title="${escapeAttr(title)}" aria-label="${escapeAttr(label)}">
        <span class="buddj-icon-search__svg" aria-hidden="true">${LOUPE_SVG}</span>
      </button>
    `;
  }
}

customElements.define(BuddjIconSearch.tagName, BuddjIconSearch);
