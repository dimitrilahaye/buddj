/**
 * Modal de confirmation : fond flouté, titre, boutons Annuler / Confirmer.
 * API : show({ title, cancelLabel, confirmLabel, onConfirm, onCancel })
 */
import { escapeHtml } from '../../shared/escape.js';

export interface ConfirmModalShowOptions {
  title: string;
  description?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export type BuddjConfirmModalElement = HTMLElement & { show: (o: ConfirmModalShowOptions) => void };

export class BuddjConfirmModal extends HTMLElement {
  static readonly tagName = 'buddj-confirm-modal';

  private _options: {
    title: string;
    description: string;
    cancelLabel: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  } | null = null;

  connectedCallback(): void {
    this.render();
  }

  show(options: ConfirmModalShowOptions): void {
    this._options = {
      title: options.title,
      description: options.description ?? '',
      cancelLabel: options.cancelLabel ?? 'Annuler',
      confirmLabel: options.confirmLabel ?? 'Confirmer',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    };
    this.render();
    this.classList.add('confirm-modal--open');
  }

  hide(): void {
    this.classList.remove('confirm-modal--open');
    this._options = null;
    this.innerHTML = '';
  }

  private render(): void {
    if (!this._options) {
      this.innerHTML = '';
      return;
    }
    const { title, description, cancelLabel, confirmLabel } = this._options;
    const descriptionHtml = description
      ? `<p class="confirm-modal-description">${escapeHtml(description)}</p>`
      : '';
    this.innerHTML = `
      <div class="confirm-modal-backdrop" data-confirm-modal-backdrop aria-hidden="true"></div>
      <div class="confirm-modal-box" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
        <p id="confirm-modal-title" class="confirm-modal-title">${escapeHtml(title)}</p>
        ${descriptionHtml}
        <div class="confirm-modal-actions">
          <button type="button" class="btn confirm-modal-btn confirm-modal-btn--cancel">${escapeHtml(cancelLabel)}</button>
          <button type="button" class="btn confirm-modal-btn confirm-modal-btn--confirm">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;
    this.attachListeners();
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-confirm-modal-backdrop]');
    const cancelBtn = this.querySelector('.confirm-modal-btn--cancel');
    const confirmBtn = this.querySelector('.confirm-modal-btn--confirm');

    const close = (): void => {
      this.hide();
    };

    backdrop?.addEventListener('click', () => {
      this._options?.onCancel();
      close();
    });

    cancelBtn?.addEventListener('click', () => {
      this._options?.onCancel();
      close();
    });

    confirmBtn?.addEventListener('click', () => {
      this._options?.onConfirm();
      close();
    });
  }
}

customElements.define(BuddjConfirmModal.tagName, BuddjConfirmModal);
