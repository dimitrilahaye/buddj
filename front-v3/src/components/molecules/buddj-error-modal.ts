/**
 * Modal d'erreur : fond flouté, titre, message, bouton Fermer.
 * API : show({ title?, message }), hide()
 */
import { escapeHtml } from '../../shared/escape.js';

export interface ErrorModalShowOptions {
  title?: string;
  message: string;
}

export class BuddjErrorModal extends HTMLElement {
  static readonly tagName = 'buddj-error-modal';

  show({ title = 'Erreur', message }: ErrorModalShowOptions): void {
    this.innerHTML = `
      <div class="error-modal-backdrop" data-error-modal-backdrop aria-hidden="true"></div>
      <div class="error-modal-box" role="alertdialog" aria-modal="true" aria-labelledby="error-modal-title" aria-describedby="error-modal-message">
        <h2 id="error-modal-title" class="error-modal-title">${escapeHtml(title)}</h2>
        <p id="error-modal-message" class="error-modal-message">${escapeHtml(message)}</p>
        <div class="error-modal-actions">
          <button type="button" class="error-modal-btn" data-error-modal-close>Fermer</button>
        </div>
      </div>
    `;
    this.attachListeners();
    this.classList.add('error-modal--open');
  }

  hide(): void {
    this.classList.remove('error-modal--open');
    this.innerHTML = '';
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-error-modal-backdrop]');
    const closeBtn = this.querySelector('[data-error-modal-close]');
    const close = (): void => this.hide();
    backdrop?.addEventListener('click', close);
    closeBtn?.addEventListener('click', close);
  }
}

customElements.define(BuddjErrorModal.tagName, BuddjErrorModal);
