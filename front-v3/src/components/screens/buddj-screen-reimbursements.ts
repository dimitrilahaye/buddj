/**
 * Écran Remboursements : dépenses à se rembourser (ex. concert 200€ pris sur l’épargne).
 * Même structure que Économies : buddj-goal-card (style budget-card), total restant sticky, actions et dropdown.
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { GoalDrawerOnValidate } from '../organisms/buddj-goal-add-drawer.js';
import type { BuddjGoalAmountDrawerElement } from '../organisms/buddj-goal-amount-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import type { GoalItem } from '../../shared/goal.js';
import {
  canGoBack,
  canGoForward,
  DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
  formatEuros,
  getRemaining,
  parseEurosToNumber,
} from '../../shared/goal.js';

const MOCK_ITEMS: GoalItem[] = [
  { id: 'r1', label: 'Concert ACDC', icon: '🎸', totalGoal: 200, additions: [50], currentIndex: 0 },
  { id: 'r2', label: 'Achat vélo', icon: '🚲', totalGoal: 350, additions: [], currentIndex: -1 },
  { id: 'r3', label: 'Courses avancées', icon: '🛒', totalGoal: 80, additions: [80], currentIndex: 0 },
  { id: 'r4', label: 'Nouveau manteau', icon: '🧥', totalGoal: 80, additions: [80], currentIndex: 0 },
];

export class BuddjScreenReimbursements extends HTMLElement {
  static readonly tagName = 'buddj-screen-reimbursements';

  private _items: GoalItem[] = [];

  connectedCallback(): void {
    if (this.querySelector('.goal-list')) return;
    this._items = MOCK_ITEMS.map((i) => ({ ...i, additions: [...i.additions], currentIndex: i.currentIndex }));
    this.render();
    this.attachListeners();
  }

  private getTotalRemaining(): number {
    return this._items.reduce((s, it) => s + getRemaining(it), 0);
  }

  private render(): void {
    const totalRemaining = this.getTotalRemaining();
    const listHtml = this._items
      .map((item) => {
        const remaining = getRemaining(item);
        const backDisabled = !canGoBack(item);
        const fwdDisabled = !canGoForward(item);
        return `
        <buddj-goal-card
          data-id="${escapeAttr(item.id)}"
          name="${escapeAttr(item.label)}"
          icon="${escapeAttr(item.icon)}"
          allocated="${item.totalGoal}"
          remaining="${remaining}"
          ${backDisabled ? ' back-disabled="true"' : ''}
          ${fwdDisabled ? ' forward-disabled="true"' : ''}
        ></buddj-goal-card>`;
      })
      .join('');

    const main = document.createElement('main');
    main.className = 'screen screen--reimbursements';
    main.innerHTML = `
      <div class="goal-screen-sticky-wrap">
        <header class="new-month-header">
          <h1 class="new-month-title">Remboursements</h1>
        </header>
        <div class="new-month-projected-sticky" aria-live="polite">
          <span class="new-month-projected-label">Total restant à rembourser</span>
          <span class="new-month-projected" data-new-month-projected>${escapeHtml(formatEuros(parseFloat(String(totalRemaining)) || 0))}</span>
        </div>
      </div>
      <section class="goal-section">
        <div class="goal-section-header">
          <buddj-btn-add label="Ajouter un remboursement" title="Ajouter un remboursement" data-goal-add-btn></buddj-btn-add>
        </div>
        <div class="goal-list" aria-label="Liste des remboursements" role="list">
          ${listHtml}
        </div>
        ${this._items.length === 0 ? '<p class="goal-empty">Aucun remboursement pour l\'instant.</p>' : ''}
      </section>
    `;
    this.innerHTML = '';
    this.appendChild(main);
  }

  private attachListeners(): void {
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('[data-goal-add-btn]')) {
        e.preventDefault();
        this.openAddDrawer();
        return;
      }
      const card = target.closest('buddj-goal-card');
      const id = card?.getAttribute('data-id');
      if (!id) return;

      const action = (target.closest('[data-action]') as Element)?.getAttribute('data-action');
      if (action === 'add') {
        e.preventDefault();
        this.openAddAmountDrawer(id);
        return;
      }
      if (action === 'add-remaining') {
        e.preventDefault();
        this.openAddRemainingDrawer(id);
        return;
      }
    });

    this.addEventListener('buddj-dropdown-action', ((e: CustomEvent<{ actionId: string; targetId: string }>) => {
      const { actionId, targetId } = e.detail;
      if (actionId === 'back') this.goBack(targetId);
      if (actionId === 'forward') this.goForward(targetId);
      if (actionId === 'update') this.openEditDrawer(targetId);
      if (actionId === 'delete') this.confirmDelete(targetId);
      if (actionId === 'delete-victory') this.confirmDeleteVictory(targetId);
    }) as EventListener);
  }

  private openAddAmountDrawer(id: string): void {
    const item = this._items.find((i) => i.id === id);
    if (!item) return;
    const remaining = getRemaining(item);
    if (remaining <= 0) return;
    const drawer = document.getElementById('goal-amount-drawer') as BuddjGoalAmountDrawerElement;
    drawer?.open({
      title: 'Ajouter une somme',
      initialAmount: '0,00 €',
      maxAmount: remaining,
      onValidate: (amountStr: string) => {
        const value = parseEurosToNumber(amountStr);
        item.additions.push(value);
        item.currentIndex = item.additions.length - 1;
        this.render();
        this.showToast('Somme ajoutée.');
      },
    });
  }

  private openAddRemainingDrawer(id: string): void {
    const item = this._items.find((i) => i.id === id);
    if (!item) return;
    const remaining = getRemaining(item);
    if (remaining <= 0) return;
    const drawer = document.getElementById('goal-amount-drawer') as BuddjGoalAmountDrawerElement;
    const initialStr = formatEuros(parseFloat(String(remaining)) || 0);
    drawer?.open({
      title: 'Ajouter la somme restante',
      initialAmount: initialStr,
      maxAmount: remaining,
      onValidate: (amountStr: string) => {
        const value = parseEurosToNumber(amountStr);
        item.additions.push(value);
        item.currentIndex = item.additions.length - 1;
        this.render();
        this.showToast('Somme ajoutée.');
      },
    });
  }

  private openAddDrawer(): void {
    const drawer = document.getElementById('goal-add-drawer') as HTMLElement & {
      open: (o: { title: string; defaultEmoji?: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Ajouter un remboursement',
      defaultEmoji: DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const totalGoal = Math.max(0, parseEurosToNumber(totalStr));
        const newItem: GoalItem = {
          id: 'r-' + Date.now(),
          label,
          icon: emoji,
          totalGoal,
          additions: [],
          currentIndex: -1,
        };
        this._items.push(newItem);
        this._items.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        this.render();
        this.showToast('Remboursement ajouté.');
      },
    });
  }

  private openEditDrawer(id: string): void {
    const item = this._items.find((i) => i.id === id);
    if (!item) return;
    const drawer = document.getElementById('goal-edit-drawer') as HTMLElement & {
      open: (o: { title?: string; initialLabel: string; initialTotal: string; initialEmoji?: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Mettre à jour le remboursement',
      initialLabel: item.label,
      initialTotal: formatEuros(parseFloat(String(item.totalGoal)) || 0),
      initialEmoji: item.icon?.trim() ? item.icon : DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        item.label = label;
        item.icon = emoji;
        item.totalGoal = Math.max(0, parseEurosToNumber(totalStr));
        this.render();
        this.showToast('Remboursement mis à jour.');
      },
    });
  }

  private goBack(id: string): void {
    const item = this._items.find((i) => i.id === id);
    if (!item || item.currentIndex < 0) return;
    item.currentIndex--;
    this.render();
    this.showToast('Retour arrière effectué');
  }

  private goForward(id: string): void {
    const item = this._items.find((i) => i.id === id);
    if (!item || item.currentIndex >= item.additions.length - 1) return;
    item.currentIndex++;
    this.render();
    this.showToast('Retour avant effectué');
  }

  private confirmDelete(id: string): void {
    const item = this._items.find((i) => i.id === id);
    const label = item?.label ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer le remboursement « ${label} » ?`,
      onConfirm: () => {
        this._items = this._items.filter((i) => i.id !== id);
        this.render();
        this.showToast('Le remboursement a bien été supprimé');
      },
      onCancel: () => {},
    });
  }

  private confirmDeleteVictory(id: string): void {
    const item = this._items.find((i) => i.id === id);
    const label = item?.label ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Supprimer « ${label} » (remboursement terminé) ?`,
      onConfirm: () => {
        this._items = this._items.filter((i) => i.id !== id);
        this.render();
        this.showToast('Remboursement supprimé (victoire)');
      },
      onCancel: () => {},
    });
  }

  private showToast(message: string): void {
    const toast = getToast();
    toast?.show({ message });
  }
}

customElements.define(BuddjScreenReimbursements.tagName, BuddjScreenReimbursements);
