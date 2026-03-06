/**
 * Drawer d’ajout d’un budget : emoji (picker global), label, montant (calculette globale), Annuler / Valider.
 * Même modèle que l’ajout de charge et de dépense.
 */
import type { BuddjEmojiPickerDrawerElement } from './buddj-emoji-picker-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

const DEFAULT_BUDGET_EMOJI = '💰';

/** Callback de validation des drawers budget/charge (add/edit) : label, amount, emoji */
export type BudgetChargeDrawerOnValidate = (label: string, amount: string, emoji: string) => void;

export interface BudgetAddDrawerOptions {
  title?: string;
  initialLabel?: string;
  initialAmount?: string;
  initialEmoji?: string;
  /** Si fourni, mode édition : au valid on appelle ce callback au lieu d’émettre l’événement. */
  onValidate?: BudgetChargeDrawerOnValidate;
}

export type BuddjBudgetAddDrawerElement = HTMLElement & { open: () => void };

export class BuddjBudgetAddDrawer extends HTMLElement {
  static readonly tagName = 'buddj-budget-add-drawer';

  private _label = '';
  private _amount = '0,00 €';
  private _emoji = DEFAULT_BUDGET_EMOJI;
  private _onValidate: BudgetChargeDrawerOnValidate | null = null;

  private _title = 'Ajouter un budget';

  open(options?: BudgetAddDrawerOptions): void {
    this._title = options?.title ?? 'Ajouter un budget';
    this._label = options?.initialLabel ?? '';
    this._amount = options?.initialAmount ?? '0,00 €';
    this._emoji = options?.initialEmoji ?? DEFAULT_BUDGET_EMOJI;
    this._onValidate = options?.onValidate ?? null;
    this.render();
    this.classList.add('budget-add-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('budget-add-drawer--open');
  }

  private render(): void {
    this.innerHTML = `
      <div class="budget-add-drawer-backdrop" data-budget-add-backdrop></div>
      <div class="budget-add-drawer-panel" role="dialog" aria-modal="true" aria-label="Ajouter un budget">
        <div class="budget-add-drawer-header">
          <h2 class="budget-add-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="budget-add-drawer-body">
          <div class="budget-add-drawer-field">
            <span class="budget-add-drawer-label">Libellé</span>
            <div class="budget-add-drawer-label-row">
              <button type="button" class="budget-add-emoji-btn" data-budget-add-emoji aria-label="Choisir un emoji">${escapeHtml(this._emoji)}</button>
              <input type="text" class="budget-add-drawer-input" data-budget-add-label placeholder="Ex. Vacances" value="${escapeAttr(this._label)}" aria-label="Libellé du budget">
            </div>
          </div>
          <label class="budget-add-drawer-field">
            <span class="budget-add-drawer-label">Montant</span>
            <button type="button" class="budget-add-drawer-amount" data-budget-add-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
          </label>
        </div>
        <div class="budget-add-drawer-footer">
          <button type="button" class="btn budget-add-drawer-cancel">Annuler</button>
          <button type="button" class="btn budget-add-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-budget-add-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    const emojiBtn = this.querySelector('[data-budget-add-emoji]');
    emojiBtn?.addEventListener('click', () => this.openEmojiPicker());

    const labelInput = this.querySelector('[data-budget-add-label]');
    const clearLabelError = (): void => {
      labelInput?.closest('.budget-add-drawer-field')?.classList.remove('budget-add-drawer-field--error');
    };
    labelInput?.addEventListener('focus', clearLabelError);
    labelInput?.addEventListener('input', clearLabelError);

    const amountBtn = this.querySelector('[data-budget-add-amount]');
    amountBtn?.addEventListener('click', () => this.openCalculator());

    const cancelBtn = this.querySelector('.budget-add-drawer-cancel');
    cancelBtn?.addEventListener('click', () => this.close());

    const validateBtn = this.querySelector('.budget-add-drawer-validate');
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
    const el = this.querySelector('[data-budget-add-emoji]');
    if (el) el.textContent = this._emoji;
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      startWithInitialValue: this._amount !== '0,00 €',
      onValidate: (value: string) => {
        this._amount = value;
        this.updateAmountDisplay();
      },
      onCancel: () => {},
    });
  }

  private updateAmountDisplay(): void {
    const el = this.querySelector('[data-budget-add-amount]');
    if (el) el.textContent = this._amount;
  }

  private doValidate(): void {
    const labelInput = this.querySelector('[data-budget-add-label]') as HTMLInputElement;
    this._label = labelInput?.value?.trim() ?? '';
    const toast = getToast();
    if (!this._label) {
      labelInput?.closest('.budget-add-drawer-field')?.classList.add('budget-add-drawer-field--error');
      toast?.show({ message: 'Le champ libellé est requis', variant: 'warning' });
      return;
    }
    this.close();
    if (this._onValidate) {
      this._onValidate(this._label, this._amount, this._emoji);
      toast?.show({ message: 'Le budget a bien été modifié' });
    } else {
      this.dispatchEvent(new CustomEvent('buddj-budget-add-done', { bubbles: true, detail: { label: this._label, amount: this._amount, emoji: this._emoji } }));
      toast?.show({ message: 'Le budget a bien été ajouté' });
    }
  }
}

customElements.define(BuddjBudgetAddDrawer.tagName, BuddjBudgetAddDrawer);
