/**
 * Drawer pour ajouter une somme (économies / remboursements).
 * Champ montant (ouvre la calculette), max = restant, validation puis toast.
 */
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';

function parseEuros(s: string): number {
  const cleaned = s.replace(/\s/g, '').replace('€', '').trim().replace(',', '.');
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

export interface GoalAmountDrawerOpenOptions {
  title?: string;
  initialAmount: string;
  maxAmount: number;
  onValidate: (amountStr: string) => void;
}

export type BuddjGoalAmountDrawerElement = HTMLElement & { open: (o: GoalAmountDrawerOpenOptions) => void };

export class BuddjGoalAmountDrawer extends HTMLElement {
  static readonly tagName = 'buddj-goal-amount-drawer';

  private _title = 'Ajouter une somme';
  private _amount = '0,00 €';
  private _maxAmount = 0;
  private _onValidate: ((amountStr: string) => void) | null = null;

  open(options: GoalAmountDrawerOpenOptions): void {
    this._title = options.title ?? 'Ajouter une somme';
    this._amount = options.initialAmount;
    this._maxAmount = options.maxAmount;
    this._onValidate = options.onValidate;
    this.render();
    this.classList.add('goal-amount-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('goal-amount-drawer--open');
  }

  private render(): void {
    const maxStr = this._maxAmount.toFixed(2).replace('.', ',') + ' €';
    this.innerHTML = `
      <div class="goal-amount-drawer-backdrop" data-goal-amount-backdrop></div>
      <div class="goal-amount-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._title)}">
        <div class="goal-amount-drawer-header">
          <h2 class="goal-amount-drawer-title">${escapeHtml(this._title)}</h2>
        </div>
        <div class="goal-amount-drawer-body">
          <label class="goal-amount-drawer-field">
            <span class="goal-amount-drawer-label">Montant</span>
            <button type="button" class="goal-amount-drawer-amount" data-goal-amount-btn>${escapeHtml(this._amount)}</button>
          </label>
          <p class="goal-amount-drawer-hint">Max. ${escapeHtml(maxStr)}</p>
        </div>
        <div class="goal-amount-drawer-footer">
          <button type="button" class="btn goal-amount-drawer-cancel">Annuler</button>
          <button type="button" class="btn goal-amount-drawer-validate">Valider</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    this.querySelector('[data-goal-amount-backdrop]')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-amount-drawer-cancel')?.addEventListener('click', () => this.close());
    this.querySelector('.goal-amount-drawer-validate')?.addEventListener('click', () => this.doValidate());
    this.querySelector('[data-goal-amount-btn]')?.addEventListener('click', () => this.openCalculator());
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    const raw = this._amount.replace(/\s/g, '').replace('€', '').trim().replace(',', '.');
    const hasValue = parseEuros(this._amount) > 0;
    calculator?.open({
      initialValue: raw || '0',
      title: this._title,
      startWithInitialValue: hasValue,
      onValidate: (value: string) => {
        this._amount = value;
        const btn = this.querySelector('[data-goal-amount-btn]');
        if (btn) btn.textContent = value;
      },
      onCancel: () => {},
    });
  }

  private doValidate(): void {
    const value = parseEuros(this._amount);
    if (value <= 0) {
      this.showToast('Indiquez un montant.');
      return;
    }
    if (value > this._maxAmount) {
      const maxStr = this._maxAmount.toFixed(2).replace('.', ',') + ' €';
      this.showToast('Le montant ne peut pas dépasser ' + maxStr + '.');
      this.querySelector('.goal-amount-drawer-field')?.classList.add('goal-amount-drawer-field--error');
      return;
    }
    this._onValidate?.(this._amount);
    this.close();
  }

  private showToast(message: string): void {
    const toast = getToast();
    toast?.show({ message });
  }
}

customElements.define(BuddjGoalAmountDrawer.tagName, BuddjGoalAmountDrawer);
