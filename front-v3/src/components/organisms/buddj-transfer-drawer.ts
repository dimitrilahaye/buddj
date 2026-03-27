/**
 * Drawer de transfert : montant (calculette + bouton Max), liste des destinations (budgets ou solde).
 * Chaque destination affiche le montant actuel et le montant après transfert.
 */
import { getToast } from '../atoms/buddj-toast.js';
import type { BuddjCalculatorDrawerElement } from './buddj-calculator-drawer.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { parseEurosToNumber } from '../../shared/goal.js';

export type TransferSource = 'outflows' | 'budget';

export interface TransferDestination {
  id: string;
  label: string;
  icon?: string;
  /** Montant actuel (parsable, ex. "145" ou "412,00"). */
  currentAmount: string;
}

function formatAmount(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export class BuddjTransferDrawer extends HTMLElement {
  static readonly tagName = 'buddj-transfer-drawer';

  private _source: TransferSource = 'outflows';
  private _maxAmount = '0 €';
  private _maxLabel = '';
  private _amount = '0,00 €';
  private _destinations: TransferDestination[] = [];
  private _onTransfer: ((amount: string, destinationId: string) => void) | null = null;

  open(options: {
    source: TransferSource;
    maxAmount: string;
    maxLabel: string;
    destinations: TransferDestination[];
    onTransfer: (amount: string, destinationId: string) => void;
  }): void {
    this._source = options.source;
    this._maxAmount = options.maxAmount;
    this._maxLabel = options.maxLabel;
    this._amount = '0,00 €';
    this._destinations = options.destinations;
    this._onTransfer = options.onTransfer;
    this.render();
    this.classList.add('transfer-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('transfer-drawer--open');
    this._onTransfer = null;
  }

  private render(): void {
    const maxHint =
      this._source === 'outflows' ? `(${escapeHtml(this._maxLabel)})` : '(€ restants)';
    const maxLine = `Max. ${escapeHtml(this._maxAmount)} <span class="transfer-drawer-max-hint">${maxHint}</span>`;
    const transferNum = parseEurosToNumber(this._amount);
    const destinationsHtml = this._destinations
      .map((d) => {
        const current = parseEurosToNumber(d.currentAmount);
        const after = current + transferNum;
        const canRemettreAZero = current < 0;
        return `<div class="transfer-drawer-dest-row">
            <button type="button" class="transfer-drawer-dest" data-destination-id="${escapeAttr(d.id)}" data-current-amount="${escapeAttr(d.currentAmount)}" aria-label="Transférer vers ${escapeAttr(d.label)}">
              ${d.icon ? `<span class="transfer-drawer-dest-icon" aria-hidden="true">${escapeHtml(d.icon)}</span>` : ''}
              <span class="transfer-drawer-dest-info">
                <span class="transfer-drawer-dest-label">${escapeHtml(d.label)}</span>
                <span class="transfer-drawer-dest-amounts">
                  <span class="transfer-drawer-dest-current">${escapeHtml(formatAmount(current))}</span>
                  <span class="transfer-drawer-dest-arrow" aria-hidden="true">→</span>
                  <span class="transfer-drawer-dest-after">${escapeHtml(formatAmount(after))}</span>
                </span>
              </span>
            </button>
            <button type="button" class="transfer-drawer-dest-to-zero" data-current-amount="${escapeAttr(d.currentAmount)}" title="Renseigner le montant pour que cette destination passe à zéro" aria-label="Remettre cette destination à zéro" ${!canRemettreAZero ? ' disabled' : ''}>Remettre à 0</button>
          </div>`;
      })
      .join('');
    this.innerHTML = `
      <div class="transfer-drawer-backdrop" data-transfer-backdrop></div>
      <div class="transfer-drawer-panel" role="dialog" aria-modal="true" aria-label="Transférer">
        <div class="transfer-drawer-header">
          <h2 class="transfer-drawer-title">Transférer</h2>
        </div>
        <div class="transfer-drawer-body">
          <p class="transfer-drawer-max">${maxLine}</p>
          <div class="transfer-drawer-field transfer-drawer-field--amount">
            <span class="transfer-drawer-label">Montant</span>
            <div class="transfer-drawer-amount-row">
              <button type="button" class="transfer-drawer-amount-btn" data-transfer-amount aria-label="Montant (ouvrir la calculatrice)">${escapeHtml(this._amount)}</button>
              <button type="button" class="transfer-drawer-max-btn" data-transfer-max>Max</button>
            </div>
          </div>
          <div class="transfer-drawer-destinations">
            <span class="transfer-drawer-dest-title">Vers</span>
            <div class="transfer-drawer-dest-list">${destinationsHtml}</div>
          </div>
        </div>
        <div class="transfer-drawer-footer">
          <button type="button" class="btn transfer-drawer-cancel">Annuler</button>
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    const backdrop = this.querySelector('[data-transfer-backdrop]');
    backdrop?.addEventListener('click', () => this.close());

    const amountBtn = this.querySelector('[data-transfer-amount]');
    amountBtn?.addEventListener('click', () => this.openCalculator());

    const maxBtn = this.querySelector('[data-transfer-max]');
    maxBtn?.addEventListener('click', () => this.setMaxAmount());

    const cancelBtn = this.querySelector('.transfer-drawer-cancel');
    cancelBtn?.addEventListener('click', () => this.close());

    const destButtons = this.querySelectorAll('.transfer-drawer-dest');
    destButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.destinationId ?? '';
        this.doTransfer(id);
      });
    });

    this.querySelectorAll('.transfer-drawer-dest-to-zero').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentStr = (btn as HTMLElement).dataset.currentAmount ?? '0';
        const current = parseEurosToNumber(currentStr);
        if (current >= 0) return;
        this._amount = formatAmount(-current);
        this.updateAmountDisplay();
      });
    });
  }

  private openCalculator(): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement;
    const hasAmount = parseEurosToNumber(this._amount) > 0;
    calculator?.open({
      title: 'Montant',
      initialValue: this._amount,
      startWithInitialValue: hasAmount,
      onValidate: (value: string) => {
        this._amount = value;
        this.updateAmountDisplay();
      },
      onCancel: () => {},
    });
  }

  private setMaxAmount(): void {
    this._amount = this._maxAmount.replace(/\s*restant(s)?$/i, '').trim();
    if (!this._amount.endsWith('€')) this._amount += ' €';
    this.updateAmountDisplay();
  }

  private updateAmountDisplay(): void {
    const el = this.querySelector('[data-transfer-amount]');
    if (el) el.textContent = this._amount;
    this.querySelector('.transfer-drawer-field--amount')?.classList.remove('transfer-drawer-field--error');
    const transferNum = parseEurosToNumber(this._amount);
    this.querySelectorAll('.transfer-drawer-dest').forEach((btn) => {
      const currentStr = (btn as HTMLElement).dataset.currentAmount ?? '0';
      const current = parseEurosToNumber(currentStr);
      const after = current + transferNum;
      const afterEl = btn.querySelector('.transfer-drawer-dest-after');
      if (afterEl) afterEl.textContent = formatAmount(after);
    });
    this.querySelectorAll('.transfer-drawer-dest-to-zero').forEach((btn) => {
      const currentStr = (btn as HTMLElement).dataset.currentAmount ?? '0';
      const current = parseEurosToNumber(currentStr);
      (btn as HTMLButtonElement).disabled = current >= 0;
    });
  }

  private doTransfer(destinationId: string): void {
    const amountBtn = this.querySelector('[data-transfer-amount]');
    const amount = (amountBtn?.textContent ?? '').trim();
    const isEmpty = !amount || amount === '0,00 €' || amount === '0 €';
    const toast = getToast();
    if (isEmpty) {
      this.querySelector('.transfer-drawer-field--amount')?.classList.add('transfer-drawer-field--error');
      toast?.show({ message: 'Le champ montant est requis', variant: 'warning' });
      return;
    }
    const maxNum = parseEurosToNumber(this._maxAmount);
    const amountNum = parseEurosToNumber(amount);
    if (amountNum > maxNum) {
      this.querySelector('.transfer-drawer-field--amount')?.classList.add('transfer-drawer-field--error');
      toast?.show({ message: 'Le montant ne peut pas dépasser le maximum', variant: 'warning' });
      return;
    }
    this._onTransfer?.(amount, destinationId);
    this.close();
  }
}

customElements.define(BuddjTransferDrawer.tagName, BuddjTransferDrawer);
