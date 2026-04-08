import { escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

export interface InjectionReminderRenderOptions {
  totalTransferred: number;
  targetLabel: string;
}

export type BuddjInjectionReminderElement = HTMLElement & {
  renderReminder: (options: InjectionReminderRenderOptions) => void;
};

export class BuddjInjectionReminder extends HTMLElement {
  static readonly tagName = 'buddj-injection-reminder';

  private _totalTransferred = 0;
  private _targetLabel = '';

  connectedCallback(): void {
    this.render();
    this.attachListeners();
  }

  renderReminder(options: InjectionReminderRenderOptions): void {
    this._totalTransferred = options.totalTransferred;
    this._targetLabel = options.targetLabel;
    this.render();
    this.attachListeners();
  }

  private render(): void {
    this.innerHTML = `
      <div class="injection-reminder-card" role="status" aria-live="polite">
        <button type="button" class="injection-reminder-close" data-injection-reminder-close aria-label="Fermer">✕</button>
        <p class="injection-reminder-title">Rappel virement</p>
        <p class="injection-reminder-text">
          Vous venez de transférer <strong>${escapeHtml(formatEuros(this._totalTransferred))}</strong> vers ${escapeHtml(
            this._targetLabel
          )}.
        </p>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-injection-reminder-close]')?.addEventListener('click', () => {
      this.remove();
    });
  }
}

customElements.define(BuddjInjectionReminder.tagName, BuddjInjectionReminder);
