/**
 * Drawer d’ajout d’une dépense dans un budget : emoji (picker global), label, montant (calculette globale), Annuler / Valider.
 * Même modèle que l’ajout de charge.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { parseEurosToNumber } from '../../shared/goal.js';

const DEFAULT_EXPENSE_EMOJI = '🛒';

export type BuddjExpenseAddDrawerOpenOptions = { weeklyBudgetId?: string };

export type BuddjExpenseAddDrawerElement = HTMLElement & {
  open: (opts?: BuddjExpenseAddDrawerOpenOptions) => void;
};

export class BuddjExpenseAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-expense-add-drawer';

  private _label = '';
  private _amount = '0,00 €';
  private _emoji = DEFAULT_EXPENSE_EMOJI;
  private _weeklyBudgetId = '';

  open(opts?: BuddjExpenseAddDrawerOpenOptions): void {
    this._weeklyBudgetId = opts?.weeklyBudgetId ?? '';
    this._label = '';
    this._amount = '0,00 €';
    this._emoji = DEFAULT_EXPENSE_EMOJI;
    this.render();
    this.classList.add('expense-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('expense-add-drawer--open');
  }

  private render(): void {
    this.innerHTML = `
      <div class="expense-add-drawer-backdrop" data-expense-add-backdrop></div>
      <div class="expense-add-drawer-panel" role="dialog" aria-modal="true" aria-label="Ajouter une dépense">
        <div class="expense-add-drawer-header">
          <h2 class="expense-add-drawer-title">Ajouter une dépense</h2>
        </div>
        <div class="expense-add-drawer-body">
          <div class="expense-add-drawer-field">
            <span class="expense-add-drawer-label">Libellé</span>
            <div class="expense-add-drawer-label-row">
              <button type="button" class="expense-add-emoji-btn" data-expense-add-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <input type="text" class="expense-add-drawer-input" data-expense-add-label placeholder="Ex. Billet train" value="${escapeAttr(this._label)}" aria-label="Libellé de la dépense">
            </div>
          </div>
          <label class="expense-add-drawer-field">
            <span class="expense-add-drawer-label">Montant</span>
            <button type="button" class="expense-add-drawer-amount" data-expense-add-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
          </label>
        </div>
        <div class="expense-add-drawer-footer">
          <button type="button" class="btn expense-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn expense-add-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-expense-add-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    const emojiBtn = this.querySelector('[data-expense-add-emoji]');
    emojiBtn?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-expense-add-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.expense-add-drawer-field')?.classList.remove('expense-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    const amountBtn = this.querySelector('[data-expense-add-amount]');
    amountBtn?.addEventListener('click', () => this.openCalculator());

    const cancelBtn = this.querySelector('.expense-add-drawer-cancel');
    cancelBtn?.addEventListener('click', () => this.close());

    const validateBtn = this.querySelector('.expense-add-drawer-validate');
    validateBtn?.addEventListener('click', () => this.doValidate());
  }

  private openEmojiPicker(): void {
    const picker = document.getElementById('emoji-picker-drawer') as BuddjEmojiPickerDrawerElement;
    picker?.open({
      defaultEmoji: this._emoji,
      onSelect: (emoji: string) => {
        this._emoji = emoji;
        this.updateEmojiDisplay();
      },
    });
  }

  private updateEmojiDisplay(): void {
    const el = this.querySelector('[data-expense-add-emoji]');
    if (el) el.textContent = this._emoji;
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      onValidate: (value: string) => {
        this._amount = value;
        this.updateAmountDisplay();
      },
      onCancel: () => {},
    });
  }

  private updateAmountDisplay(): void {
    const el = this.querySelector('[data-expense-add-amount]');
    if (el) el.textContent = this._amount;
  }

  private doValidate(): void {
    const labelInput = this.querySelector('[data-expense-add-label]') as HTMLInputElement;
    this._label = labelInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!this._label) {
      labelInput?.closest('.expense-add-drawer-field')?.classList.add('expense-add-drawer-field--error');
      toast?.show({ message: 'Le champ libellé est requis', variant: 'warning' });
      return;
    }
    if (!this._weeklyBudgetId) {
      toast?.show({ message: 'Impossible d’associer la dépense à un budget', variant: 'warning' });
      return;
    }
    const amountNum = parseEurosToNumber(this._amount);
    if (amountNum <= 0) {
      toast?.show({ message: 'Le montant doit être supérieur à 0', variant: 'warning' });
      return;
    }
    const apiLabel = `${this._emoji} ${this._label}`.trim();
    this.close();
    this.dispatchEvent(
      new CustomEvent('buddj-expense-add-submit', {
        bubbles: true,
        composed: true,
        detail: {
          weeklyBudgetId: this._weeklyBudgetId,
          label: apiLabel,
          amount: amountNum,
        },
      }),
    );
  }
}

customElements.define(BuddjExpenseAddDrawer.tagName, BuddjExpenseAddDrawer);
