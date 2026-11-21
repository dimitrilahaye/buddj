/**
 * Bandeau d'un compte épargne : flèches ← → pour passer d'un compte à l'autre, nom et solde.
 * Même allure que la navigation entre mois ; émet `savings-account-previous` / `savings-account-next`.
 */
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

export type SavingsAccountSwitcherData = {
  name: string;
  /** Solde affiché sous le nom ; null pour ne pas l'afficher */
  amount: number | null;
  hasPrevious: boolean;
  hasNext: boolean;
};

export class BuddjSavingsAccountSwitcher extends HTMLElement {
  static readonly tagName = 'buddj-savings-account-switcher';

  connectedCallback(): void {
    this.addEventListener('click', this._onClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this._onClick);
  }

  render({ name, amount, hasPrevious, hasNext }: SavingsAccountSwitcherData): void {
    this.innerHTML = `
      <div class="summary-date-row savings-account-switcher" role="group" aria-label="Comptes épargne">
        <button type="button" class="btn btn--nav-month" data-step="previous" aria-label="Compte épargne précédent" title="Compte épargne précédent"${hasPrevious ? '' : ' disabled'}>←</button>
        <div class="savings-account-switcher-text">
          <h2 class="summary-date savings-account-switcher-name">${escapeHtml(name)}</h2>
          ${
            amount === null
              ? ''
              : `<p class="savings-account-switcher-amount" aria-label="${escapeAttr(`Solde : ${formatEuros(amount)}`)}">${escapeHtml(formatEuros(amount))}</p>`
          }
        </div>
        <button type="button" class="btn btn--nav-month" data-step="next" aria-label="Compte épargne suivant" title="Compte épargne suivant"${hasNext ? '' : ' disabled'}>→</button>
      </div>
    `;
  }

  private _onClick = (e: Event): void => {
    const button = (e.target as Element).closest<HTMLButtonElement>('[data-step]');
    if (!button || button.disabled) return;
    this.dispatchEvent(new CustomEvent(`savings-account-${button.dataset.step}`, { bubbles: true }));
  };
}

customElements.define(BuddjSavingsAccountSwitcher.tagName, BuddjSavingsAccountSwitcher);
