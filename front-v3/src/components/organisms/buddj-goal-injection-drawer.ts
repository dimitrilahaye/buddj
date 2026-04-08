import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { formatEuros } from '../../shared/goal.js';

export interface GoalInjectionProjectItem {
  projectId: string;
  icon: string;
  name: string;
  allocated: number;
  remaining: number;
}

export interface GoalInjectionDrawerOpenOptions {
  title: string;
  selectedAmount: number;
  balanceAmount: number;
  projects: GoalInjectionProjectItem[];
  emptyLabel: string;
  onClose: () => void;
  onAmountClick: () => void;
  onProjectClick: (detail: { projectId: string }) => void;
}

export type BuddjGoalInjectionDrawerElement = HTMLElement & {
  open: (options: GoalInjectionDrawerOpenOptions) => void;
  close: () => void;
};

export class BuddjGoalInjectionDrawer extends HTMLElement {
  static readonly tagName = 'buddj-goal-injection-drawer';

  private _options: GoalInjectionDrawerOpenOptions | null = null;

  open(options: GoalInjectionDrawerOpenOptions): void {
    this._options = options;
    this.render();
    this.classList.add('goal-injection-drawer--open');
    this.attachListeners();
  }

  close(): void {
    this.classList.remove('goal-injection-drawer--open');
  }

  private render(): void {
    if (!this._options) return;
    const showBalanceHint = Math.abs(this._options.selectedAmount - this._options.balanceAmount) > 0.0001;
    const listHtml = this._options.projects
      .map(
        (project) => `
        <button type="button" class="goal-injection-project" data-project-id="${escapeAttr(project.projectId)}">
          <span class="goal-injection-project-icon" aria-hidden="true">${escapeHtml(project.icon)}</span>
          <span class="goal-injection-project-name">${escapeHtml(project.name)}</span>
          <span class="goal-injection-project-amount amount-totals">
            <span class="amount-remaining">${escapeHtml(formatEuros(project.remaining))}</span>
            <span class="goal-injection-project-remaining-suffix">restants</span>
          </span>
        </button>
      `
      )
      .join('');

    this.innerHTML = `
      <div class="goal-injection-drawer-backdrop" data-goal-injection-backdrop></div>
      <div class="goal-injection-drawer-panel" role="dialog" aria-modal="true" aria-label="${escapeAttr(this._options.title)}">
        <div class="goal-injection-drawer-header">
          <h2 class="goal-injection-drawer-title">
            Injecter <button type="button" class="goal-injection-drawer-amount" data-goal-injection-amount aria-label="Modifier le montant à injecter">${escapeHtml(
              formatEuros(this._options.selectedAmount)
            )}</button>${showBalanceHint ? ` <span class="goal-injection-drawer-balance-hint">(sur ${escapeHtml(formatEuros(this._options.balanceAmount))})</span>` : ''} ${escapeHtml(
              this._options.title
            )}
          </h2>
          <button type="button" class="goal-injection-drawer-close" aria-label="Fermer">✕</button>
        </div>
        <div class="goal-injection-drawer-body">
          ${
            this._options.projects.length > 0
              ? `<div class="goal-injection-project-list">${listHtml}</div>`
              : `<p class="goal-injection-empty">${escapeHtml(this._options.emptyLabel)}</p>`
          }
        </div>
      </div>
    `;
  }

  private attachListeners(): void {
    if (!this._options) return;
    this.querySelector('[data-goal-injection-backdrop]')?.addEventListener('click', () => {
      this._options?.onClose();
      this.close();
    });
    this.querySelector('.goal-injection-drawer-close')?.addEventListener('click', () => {
      this._options?.onClose();
      this.close();
    });
    this.querySelector('[data-goal-injection-amount]')?.addEventListener('click', () => {
      this._options?.onAmountClick();
    });
    this.querySelectorAll('[data-project-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const projectId = (button as HTMLElement).getAttribute('data-project-id');
        if (!projectId) return;
        this._options?.onProjectClick({ projectId });
      });
    });
  }
}

customElements.define(BuddjGoalInjectionDrawer.tagName, BuddjGoalInjectionDrawer);
