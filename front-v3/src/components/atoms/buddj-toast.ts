/**
 * Toast global : affiche un message temporaire (succès, warning, erreur).
 * API : show({ message, durationMs?, variant?: 'success' | 'warning' | 'error' })
 */
import { escapeHtml } from '../../shared/escape.js';

export interface ToastShowOptions {
  message: string;
  durationMs?: number;
  variant?: 'success' | 'warning' | 'error';
}

export type BuddjToastElement = HTMLElement & { show: (o: ToastShowOptions) => void };

/** Retourne l’élément toast global (typé), ou null si absent. */
export function getToast(): BuddjToastElement | null {
  return document.querySelector('buddj-toast') as BuddjToastElement | null;
}

export class BuddjToast extends HTMLElement {
  static readonly tagName = 'buddj-toast';

  private _hideTimer: ReturnType<typeof setTimeout> | null = null;

  show(options: ToastShowOptions): void {
    if (this._hideTimer) clearTimeout(this._hideTimer);
    const durationMs = options.durationMs ?? 1250;
    const variant = options.variant ?? 'success';
    this.classList.remove('toast--warning', 'toast--error');
    if (variant === 'warning') this.classList.add('toast--warning');
    if (variant === 'error') this.classList.add('toast--error');
    this.innerHTML = `
      <div class="toast-message" role="status">${escapeHtml(options.message)}</div>
    `;
    this.classList.add('toast--visible');
    this._hideTimer = setTimeout(() => {
      this.classList.remove('toast--visible');
      this._hideTimer = null;
    }, durationMs);
  }
}

customElements.define(BuddjToast.tagName, BuddjToast);
