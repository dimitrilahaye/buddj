/**
 * Drawer d’ajout d’un objectif (économie ou remboursement) : emoji (défaut via `defaultEmoji`, sinon 💰), intitulé, somme totale.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const FALLBACK_EMOJI = '💰';

/** Callback de validation du drawer objectif (add/edit) : label, totalStr, emoji */
export type GoalDrawerOnValidate = (label: string, totalStr: string, emoji: string) => void;

export class BuddjGoalAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-goal-add-drawer';

  private _title = 'Ajouter un objectif';
  private _label = '';
  private _total = '0,00 €';
  private _emoji = FALLBACK_EMOJI;
  private _onValidate: GoalDrawerOnValidate | null = null;

  open(options: { title: string; defaultEmoji?: string; onValidate: GoalDrawerOnValidate }): void {
    this._title = options.title;
    this._label = '';
    this._total = '0,00 €';
    this._emoji = options.defaultEmoji?.trim() || FALLBACK_EMOJI;
    this._onValidate = options.onValidate;
    this.render();
    this.classList.add('goal-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('goal-add-drawer--open');
  }

  private render(): void {
    this.innerHTML = `
      <div class="goal-add-drawer-backdrop" data-goal-add-backdrop></div>
      <div class="goal-add-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._title)}">
        <div class="goal-add-drawer-header">
          <h2 class="goal-add-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="goal-add-drawer-body">
          <div class="goal-add-drawer-field">
            <span class="goal-add-drawer-label">Intitulé</span>
            <div class="goal-add-drawer-label-row">
              <button type="button" class="goal-add-emoji-btn" data-goal-add-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <input type="text" class="goal-add-drawer-input" data-goal-add-label placeholder="Ex. Vacances" value="${escapeAttr(this._label)}" aria-label="Intitulé">
            </div>
          </div>
          <label class="goal-add-drawer-field">
            <span class="goal-add-drawer-label">Somme totale</span>
            <button type="button" class="goal-add-drawer-amount" data-goal-add-amount aria-label="Somme totale (ouvrir la calculatrice)">${escapeHtml(this._total)}</button>
          </label>
        </div>
        <div class="goal-add-drawer-footer">
          <button type="button" class="btn goal-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn goal-add-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-goal-add-backdrop]')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-add-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-add-drawer-validate')?.addEventListener('click', () => this.doValidate());
    this.querySelector('[data-goal-add-amount]')?.addEventListener('click', () => this.openCalculator());
    this.querySelector('[data-goal-add-emoji]')?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-goal-add-label]');
    const clearError = (): void => {
      labelInput?.closest('.goal-add-drawer-field')?.classList.remove('goal-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearError);
    labelInput?.addEventListener('input', clearError);
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        const btn = this.querySelector('[data-goal-add-emoji]');
        if (btn) btn.textContent = emoji;
      },
    });
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    const raw = this._total.replace(/\s/g, '').replace('€', '').trim().replace(',', '.');
    calculator?.open({
      initialValue: raw || '0',
      title: 'Somme totale',
      startWithInitialValue: false,
      onValidate: (value: string) => {
        this._total = value;
        const btn = this.querySelector('[data-goal-add-amount]');
        if (btn) btn.textContent = value;
      },
      onCancel: () => {},
    });
  }

  private doValidate(): void {
    const label = (this.querySelector('[data-goal-add-label]') as HTMLInputElement)?.value?.trim() ?? '';
    if (!label) {
      const toast = getToast();
      toast?.show({ message: 'L\'intitulé est requis.', variant: 'warning' });
      this.querySelector('.goal-add-drawer-field')?.classList.add('goal-add-drawer-field--error');
      return;
    }
    this._onValidate?.(label, this._total, this._emoji);
    this.close();
  }
}

customElements.define(BuddjGoalAddDrawer.tagName, BuddjGoalAddDrawer);
