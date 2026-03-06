/**
 * Écran Économies : objectifs d’épargne (ex. vacances 100€).
 * Liste de buddj-goal-card (style budget-card), total restant sticky, actions (ajout, max, engrenage, suppression).
 */
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { GoalDrawerOnValidate } from '../organisms/buddj-goal-add-drawer.js';
import type { BuddjGoalAmountDrawerElement } from '../organisms/buddj-goal-amount-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import type { GoalItem } from '../../shared/goal.js';
import { canGoBack, canGoForward, formatEuros, getRemaining, parseEurosToNumber } from '../../shared/goal.js';

const MOCK_ITEMS: GoalItem[] = [
  { id: 's1', label: 'Vacances', icon: '🏖️', totalGoal: 500, additions: [100, 50], currentIndex: 1 },
  { id: 's2', label: 'Électroménager', icon: '🧾', totalGoal: 200, additions: [], currentIndex: -1 },
  { id: 's3', label: 'Permis', icon: '🚗', totalGoal: 1200, additions: [400], currentIndex: 0 },
  { id: 's4', label: 'Nouveau PC', icon: '💻', totalGoal: 800, additions: [300, 500], currentIndex: 1 },
];

export class BuddjScreenSavings extends HTMLElement {
  static readonly tagName = 'buddj-screen-savings';

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
    main.className = 'screen screen--savings';
    main.innerHTML = `
      <div class="goal-screen-sticky-wrap">
        <header class="new-month-header">
          <h1 class="new-month-title">Économies</h1>
        </header>
        <div class="new-month-projected-sticky" aria-live="polite">
          <span class="new-month-projected-label">Total restant à économiser</span>
          <span class="new-month-projected" data-new-month-projected>${escapeHtml(formatEuros(parseFloat(String(totalRemaining)) || 0))}</span>
        </div>
      </div>
      <section class="goal-section">
        <div class="goal-section-header">
          <buddj-btn-add label="Ajouter une économie" title="Ajouter un objectif d'épargne" data-goal-add-btn></buddj-btn-add>
        </div>
        <div class="goal-list" aria-label="Liste des objectifs d'épargne" role="list">
          ${listHtml}
        </div>
        ${this._items.length === 0 ? '<p class="goal-empty">Aucun objectif pour l\'instant.</p>' : ''}
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
      open: (o: { title: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Ajouter une économie',
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const totalGoal = Math.max(0, parseEurosToNumber(totalStr));
        const newItem: GoalItem = {
          id: 's-' + Date.now(),
          label,
          icon: emoji,
          totalGoal,
          additions: [],
          currentIndex: -1,
        };
        this._items.push(newItem);
        this._items.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        this.render();
        this.showToast('Objectif ajouté.');
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
      title: 'Mettre à jour l\'objectif',
      initialLabel: item.label,
      initialTotal: formatEuros(parseFloat(String(item.totalGoal)) || 0),
      initialEmoji: item.icon,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        item.label = label;
        item.icon = emoji;
        item.totalGoal = Math.max(0, parseEurosToNumber(totalStr));
        this.render();
        this.showToast('Objectif mis à jour.');
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
      title: `Voulez-vous vraiment supprimer l'objectif « ${label} » ?`,
      onConfirm: () => {
        this._items = this._items.filter((i) => i.id !== id);
        this.render();
        this.showToast('L\'objectif a bien été supprimé');
      },
      onCancel: () => {},
    });
  }

  private confirmDeleteVictory(id: string): void {
    const item = this._items.find((i) => i.id === id);
    const label = item?.label ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Supprimer « ${label} » (objectif atteint) ?`,
      onConfirm: () => {
        this._items = this._items.filter((i) => i.id !== id);
        this.render();
        this.showToast('Objectif supprimé (victoire)');
      },
      onCancel: () => {},
    });
  }

  private showToast(message: string): void {
    const toast = getToast();
    toast?.show({ message });
  }
}

customElements.define(BuddjScreenSavings.tagName, BuddjScreenSavings);
