/**
 * Modal de chargement : fond flouté, texte paramétrable, loader SVG animé (glow).
 * API : show(text), hide()
 */
import { escapeHtml } from '../../shared/escape.js';

export class BuddjLoadingModal extends HTMLElement {
  static readonly tagName = 'buddj-loading-modal';

  private _text = '';

  show(text: string): void {
    this._text = text;
    this.render();
    this.classList.add('loading-modal--open');
  }

  hide(): void {
    this.classList.remove('loading-modal--open');
    this.innerHTML = '';
  }

  private render(): void {
    this.innerHTML = `
      <div class="loading-modal-backdrop" data-loading-modal-backdrop aria-hidden="true"></div>
      <div class="loading-modal-box" role="status" aria-live="polite" aria-label="${escapeHtml(this._text)}">
        <div class="loading-modal-spinner">
          <svg class="loading-modal-svg" viewBox="0 0 50 50" aria-hidden="true">
            <defs>
              <linearGradient id="loading-modal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--mint)" />
                <stop offset="100%" stop-color="#6a9d82" />
              </linearGradient>
            </defs>
            <circle class="loading-modal-circle" cx="25" cy="25" r="20" fill="none" stroke="url(#loading-modal-gradient)" stroke-width="3" stroke-linecap="round" />
          </svg>
        </div>
        <p class="loading-modal-text">${escapeHtml(this._text)}</p>
      </div>
    `;
  }
}

customElements.define(BuddjLoadingModal.tagName, BuddjLoadingModal);
