/**
 * Écran Économies : objectifs d’épargne (ex. vacances 100€).
 * Liste de buddj-goal-card (style budget-card), total restant sticky, actions (ajout, max, menu ⋮, suppression).
 */
import type { ProjectView } from '../../application/project/project-view.js';
import type {
  AddAmountActionDetail,
  ProjectByIdActionDetail,
  UpdateProjectActionDetail,
} from '../../application/project/projects-store.js';
import type { SavingsStore } from '../../application/project/savings-store.js';
import type { MonthStore } from '../../application/month/month-store.js';
import { getCurrentMonth } from '../../application/month/month-state.js';
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { GoalDrawerOnValidate } from '../organisms/buddj-goal-add-drawer.js';
import type { BuddjGoalAmountDrawerElement } from '../organisms/buddj-goal-amount-drawer.js';
import type { BuddjGoalInjectionDrawerElement } from '../organisms/buddj-goal-injection-drawer.js';
import type { BuddjCalculatorDrawerElement } from '../organisms/buddj-calculator-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import {
  DEFAULT_GOAL_EMOJI_SAVINGS,
  formatEuros,
  parseEurosToNumber,
} from '../../shared/goal.js';

export class BuddjScreenSavings extends HTMLElement {
  static readonly tagName = 'buddj-screen-savings';

  private _store?: SavingsStore;
  private _monthStore?: MonthStore;
  private _listenersAttached = false;
  private _pendingInjectedAmount = 0;
  private _pendingInjectedProjectId = '';
  private _isInjectionDrawerOpen = false;
  private _injectionRemainingAmount = 0;
  private _injectionTemporaryAmount = 0;
  private _injectionTransferredTotal = 0;
  private _reminderTransferredTotal = 0;

  init({ savingsStore, monthStore }: { savingsStore: SavingsStore; monthStore: MonthStore }): void {
    this._store = savingsStore;
    this._monthStore = monthStore;
  }

  connectedCallback(): void {
    if (this.querySelector('.goal-list')) return;
    if (!this._store) return;
    this.render();
    this.attachListeners();
    this._store.addEventListener('projectsStateUpdated', this._onStateUpdated);
    this._store.addEventListener('projectsLoadFailed', this._onStoreError);
    this._store.addEventListener('projectCreateFailed', this._onStoreError);
    this._store.addEventListener('projectUpdateFailed', this._onStoreError);
    this._store.addEventListener('projectAddAmountFailed', this._onStoreError);
    this._store.addEventListener('projectRollbackFailed', this._onStoreError);
    this._store.addEventListener('projectReApplyFailed', this._onStoreError);
    this._store.addEventListener('projectDeleteFailed', this._onStoreError);
    this._store.addEventListener('projectCreateLoaded', this._onCreateLoaded);
    this._store.addEventListener('projectUpdateLoaded', this._onUpdateLoaded);
    this._store.addEventListener('projectAddAmountLoaded', this._onAddAmountLoaded);
    this._store.addEventListener('projectRollbackLoaded', this._onHistoryUpdated);
    this._store.addEventListener('projectReApplyLoaded', this._onHistoryUpdated);
    this._store.addEventListener('projectDeleteLoaded', this._onDeleteLoaded);
    this._monthStore?.addEventListener('currentMonthChanged', this._onMonthChanged);
    const state = this._monthStore?.getState();
    if (state && (state.months === null || state.months.length === 0) && !state.isLoadingMonths) {
      this._monthStore?.emitAction('loadUnarchivedMonths');
    }
    this._store.emitAction('loadProjects');
  }

  disconnectedCallback(): void {
    this._store?.removeEventListener('projectsStateUpdated', this._onStateUpdated);
    this._store?.removeEventListener('projectsLoadFailed', this._onStoreError);
    this._store?.removeEventListener('projectCreateFailed', this._onStoreError);
    this._store?.removeEventListener('projectUpdateFailed', this._onStoreError);
    this._store?.removeEventListener('projectAddAmountFailed', this._onStoreError);
    this._store?.removeEventListener('projectRollbackFailed', this._onStoreError);
    this._store?.removeEventListener('projectReApplyFailed', this._onStoreError);
    this._store?.removeEventListener('projectDeleteFailed', this._onStoreError);
    this._store?.removeEventListener('projectCreateLoaded', this._onCreateLoaded);
    this._store?.removeEventListener('projectUpdateLoaded', this._onUpdateLoaded);
    this._store?.removeEventListener('projectAddAmountLoaded', this._onAddAmountLoaded);
    this._store?.removeEventListener('projectRollbackLoaded', this._onHistoryUpdated);
    this._store?.removeEventListener('projectReApplyLoaded', this._onHistoryUpdated);
    this._store?.removeEventListener('projectDeleteLoaded', this._onDeleteLoaded);
    this._monthStore?.removeEventListener('currentMonthChanged', this._onMonthChanged);
  }

  private getRemaining({ project }: { project: ProjectView }): number {
    return Math.max(0, project.target - project.totalAmount);
  }

  private getTotalRemaining({ projects }: { projects: ProjectView[] }): number {
    return projects.reduce((sum, project) => sum + this.getRemaining({ project }), 0);
  }

  private getProjectById({ projectId }: { projectId: string }): ProjectView | null {
    const store = this._store;
    if (!store) return null;
    return store.getState().projects.find((project) => project.id === projectId) ?? null;
  }

  private _onStateUpdated = (): void => {
    this.render();
    if (this._isInjectionDrawerOpen) {
      this.openInjectionDrawer();
    }
  };

  private _onMonthChanged = (): void => {
    this.render();
  };

  private _onStoreError = ((e: Event) => {
    const detail = (e as CustomEvent<{ message?: string }>).detail;
    this.showToast(detail?.message ?? 'Une erreur est survenue.');
  }) as EventListener;

  private _onCreateLoaded = ((): void => {
    this.showToast('Votre économie a été crée !');
  }) as EventListener;

  private _onUpdateLoaded = ((): void => {
    this.showToast('Votre économie a bien été modifié !');
  }) as EventListener;

  private _onAddAmountLoaded = ((e: Event): void => {
    const detail = (e as CustomEvent<{ projectId?: string }>).detail;
    if (this._pendingInjectedAmount > 0 && detail?.projectId === this._pendingInjectedProjectId) {
      this._injectionRemainingAmount = Math.max(0, this._injectionRemainingAmount - this._pendingInjectedAmount);
      this._injectionTransferredTotal += this._pendingInjectedAmount;
      this._injectionTemporaryAmount = this._injectionRemainingAmount;
      this._pendingInjectedAmount = 0;
      this._pendingInjectedProjectId = '';
      this._store?.emitAction('loadProjects');
      if (this._injectionRemainingAmount <= 0) {
        this.closeInjectionDrawer({ showReminder: true });
        this.showToast(
          `Votre solde prévisionnel est à 0. Vous venez de transférer ${formatEuros(this._injectionTransferredTotal)} dans vos économies.`
        );
      }
    }
    this.showToast('Votre montant a bien été ajouté !');
  }) as EventListener;

  private _onHistoryUpdated = ((): void => {
    this.showToast("L'historique a bien été mis à jour !");
  }) as EventListener;

  private _onDeleteLoaded = ((): void => {
    this.showToast("L'économie a bien été supprimée !");
  }) as EventListener;

  private render(): void {
    const store = this._store;
    if (!store) return;
    const { projects, isLoading, loadErrorMessage } = store.getState();
    const totalRemaining = this.getTotalRemaining({ projects });
    const listHtml = projects
      .map((project) => {
        const remaining = this.getRemaining({ project });
        const parsed = splitLeadingEmoji({
          label: project.name,
          defaultIcon: DEFAULT_GOAL_EMOJI_SAVINGS,
        });
        return `
        <buddj-goal-card
          data-id="${escapeAttr(project.id)}"
          name="${escapeAttr(parsed.text || project.name)}"
          icon="${escapeAttr(parsed.icon)}"
          allocated="${project.target}"
          remaining="${remaining}"
          ${!project.canRollback ? ' back-disabled="true"' : ''}
          ${!project.canReApply ? ' forward-disabled="true"' : ''}
        ></buddj-goal-card>`;
      })
      .join('');

    const projectedBalance = this.getProjectedBalance();
    const canInject = projectedBalance > 0 && this.getInjectableProjects({ projects }).length > 0;
    const reminderHtml =
      this._reminderTransferredTotal > 0
        ? `<buddj-injection-reminder data-injection-reminder data-total="${this._reminderTransferredTotal}" data-target-label="vos économies"></buddj-injection-reminder>`
        : '';
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
      ${isLoading ? '<p class="goal-loading">Chargement…</p>' : ''}
      ${loadErrorMessage ? `<p class="goal-error" role="alert">${escapeHtml(loadErrorMessage)}</p>` : ''}
      <section class="goal-section">
        ${reminderHtml}
        <div class="goal-section-header">
          <buddj-btn-add label="Ajouter une économie" title="Ajouter un objectif d'épargne" data-goal-add-btn></buddj-btn-add>
          <buddj-actions-dropdown data-goal-injection-menu position="right">
            <button slot="trigger" type="button" class="btn-menu-dots" title="Actions">⋮</button>
            <button
              slot="items"
              type="button"
              data-action="inject-projected"
              class="goal-injection-dropdown-item"
              ${!canInject ? 'disabled' : ''}
            >
              <span class="goal-injection-dropdown-title">Injecter un montant</span>
              <span class="goal-injection-dropdown-text">Vous ne savez pas quoi faire de votre solde prévisionnel ? Et si vous vous en serviez pour boucler vos économies ?</span>
            </button>
          </buddj-actions-dropdown>
        </div>
        <div class="goal-list" aria-label="Liste des objectifs d'épargne" role="list">
          ${listHtml}
        </div>
        ${projects.length === 0 && !isLoading ? '<p class="goal-empty">Aucun objectif pour l\'instant.</p>' : ''}
      </section>
    `;
    this.innerHTML = '';
    this.appendChild(main);
    const reminder = this.querySelector('[data-injection-reminder]') as (HTMLElement & {
      renderReminder?: (options: { totalTransferred: number; targetLabel: string }) => void;
    }) | null;
    reminder?.renderReminder?.({ totalTransferred: this._reminderTransferredTotal, targetLabel: 'vos économies' });
  }

  private attachListeners(): void {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    this.addEventListener('click', (e) => {
      const target = e.target as Element;
      if (target.closest('[data-goal-add-btn]')) {
        e.preventDefault();
        this.openAddDrawer();
        return;
      }
      if (target.closest('[data-injection-reminder-close]')) {
        this._reminderTransferredTotal = 0;
        this.render();
        return;
      }
      const card = target.closest('buddj-goal-card');
      const id = card?.getAttribute('data-id');
      if (!id) return;

      const action = (target.closest('[data-action]') as Element)?.getAttribute('data-action');
      if (action === 'add') {
        e.preventDefault();
        this.openAddAmountDrawer({ projectId: id });
        return;
      }
      if (action === 'add-remaining') {
        e.preventDefault();
        this.openAddRemainingDrawer({ projectId: id });
        return;
      }
    });

    this.addEventListener('buddj-dropdown-action', ((e: CustomEvent<{ actionId: string; targetId: string }>) => {
      const { actionId, targetId } = e.detail;
      if (actionId === 'back') this.rollback({ projectId: targetId });
      if (actionId === 'forward') this.reApply({ projectId: targetId });
      if (actionId === 'update') this.openEditDrawer({ projectId: targetId });
      if (actionId === 'delete') this.confirmDelete({ projectId: targetId });
      if (actionId === 'delete-victory') this.confirmDeleteVictory({ projectId: targetId });
      if (actionId === 'inject-projected') this.startInjectionFlow();
    }) as EventListener);
  }

  private getProjectedBalance(): number {
    const month = this._monthStore ? getCurrentMonth({ state: this._monthStore.getState() }) : null;
    return Math.max(0, month?.projectedBalance ?? 0);
  }

  private getInjectableProjects({ projects }: { projects: ProjectView[] }): ProjectView[] {
    return projects.filter((project) => project.target - project.totalAmount !== 0);
  }

  private startInjectionFlow(): void {
    const store = this._store;
    if (!store) return;
    const projectedBalance = this.getProjectedBalance();
    const projects = this.getInjectableProjects({ projects: store.getState().projects });
    if (projectedBalance <= 0 || projects.length === 0) return;
    this._isInjectionDrawerOpen = true;
    this._injectionRemainingAmount = projectedBalance;
    this._injectionTemporaryAmount = projectedBalance;
    this._injectionTransferredTotal = 0;
    this.openInjectionDrawer();
  }

  private openInjectionDrawer(): void {
    const store = this._store;
    if (!store || !this._isInjectionDrawerOpen) return;
    const projects = this.getInjectableProjects({ projects: store.getState().projects }).map((project) => {
      const parsed = splitLeadingEmoji({
        label: project.name,
        defaultIcon: DEFAULT_GOAL_EMOJI_SAVINGS,
      });
      return {
        projectId: project.id,
        icon: parsed.icon,
        name: parsed.text || project.name,
        allocated: project.target,
        remaining: Math.max(0, project.target - project.totalAmount),
      };
    });
    const drawer = document.getElementById('goal-injection-drawer') as BuddjGoalInjectionDrawerElement | null;
    drawer?.open({
      title: 'dans vos économies',
      selectedAmount: this._injectionTemporaryAmount,
      balanceAmount: this._injectionRemainingAmount,
      projects,
      emptyLabel: 'Aucune économie disponible pour une injection.',
      onClose: () => {
        this.closeInjectionDrawer({ showReminder: true });
      },
      onAmountClick: () => {
        this.openInjectionCalculator({ initialAmount: this._injectionTemporaryAmount });
      },
      onProjectClick: ({ projectId }) => {
        this.confirmInjection({ projectId });
      },
    });
  }

  private openInjectionCalculator({ initialAmount }: { initialAmount: number }): void {
    const calculator = document.getElementById('calculator-drawer') as BuddjCalculatorDrawerElement | null;
    calculator?.open({
      initialValue: String(Math.max(0, initialAmount)),
      title: 'Injecter un montant',
      startWithInitialValue: true,
      onValidate: (value: string) => {
        const parsed = parseEurosToNumber(value);
        if (parsed < 0.01) {
          this.showToast('Le montant minimum est 0,01 €.');
          this.openInjectionCalculator({ initialAmount: 0.01 });
          return;
        }
        if (parsed > this._injectionRemainingAmount) {
          this.showToast('Le montant ne peut pas dépasser le solde prévisionnel.', 'warning');
          this.openInjectionCalculator({ initialAmount: this._injectionRemainingAmount });
          return;
        }
        this._injectionTemporaryAmount = parsed;
        this.openInjectionDrawer();
      },
      onCancel: () => {},
    });
  }

  private confirmInjection({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    if (!project) return;
    const remaining = Math.max(0, project.target - project.totalAmount);
    const maxInjectable = Math.min(this._injectionTemporaryAmount, this._injectionRemainingAmount, remaining);
    if (maxInjectable < 0.01) return;
    const parsed = splitLeadingEmoji({
      label: project.name,
      defaultIcon: DEFAULT_GOAL_EMOJI_SAVINGS,
    });
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous injecter ${formatEuros(maxInjectable)} dans "${parsed.icon} ${parsed.text || project.name}" ?\nIl restera ${formatEuros(this._injectionRemainingAmount - maxInjectable)}`,
      onConfirm: () => {
        this._pendingInjectedAmount = maxInjectable;
        this._pendingInjectedProjectId = projectId;
        const detail: AddAmountActionDetail = { projectId, amount: maxInjectable };
        store.emitAction('addAmountToProject', detail);
      },
      onCancel: () => {},
    });
  }

  private closeInjectionDrawer({ showReminder }: { showReminder: boolean }): void {
    this._isInjectionDrawerOpen = false;
    const drawer = document.getElementById('goal-injection-drawer') as BuddjGoalInjectionDrawerElement | null;
    drawer?.close();
    if (showReminder && this._injectionTransferredTotal > 0) {
      this._reminderTransferredTotal = this._injectionTransferredTotal;
      this.render();
    }
  }

  private openAddAmountDrawer({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    if (!project) return;
    const remaining = this.getRemaining({ project });
    if (remaining <= 0) return;
    const drawer = document.getElementById('goal-amount-drawer') as BuddjGoalAmountDrawerElement;
    drawer?.open({
      title: 'Ajouter une somme',
      initialAmount: '0,00 €',
      maxAmount: remaining,
      onValidate: (amountStr: string) => {
        const value = parseEurosToNumber(amountStr);
        const detail: AddAmountActionDetail = { projectId, amount: value };
        store.emitAction('addAmountToProject', detail);
      },
    });
  }

  private openAddRemainingDrawer({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    if (!project) return;
    const remaining = this.getRemaining({ project });
    if (remaining <= 0) return;
    const drawer = document.getElementById('goal-amount-drawer') as BuddjGoalAmountDrawerElement;
    const initialStr = formatEuros(parseFloat(String(remaining)) || 0);
    drawer?.open({
      title: 'Ajouter la somme restante',
      initialAmount: initialStr,
      maxAmount: remaining,
      onValidate: (amountStr: string) => {
        const value = parseEurosToNumber(amountStr);
        const detail: AddAmountActionDetail = { projectId, amount: value };
        store.emitAction('addAmountToProject', detail);
      },
    });
  }

  private openAddDrawer(): void {
    const store = this._store;
    if (!store) return;
    const drawer = document.getElementById('goal-add-drawer') as HTMLElement & {
      open: (o: { title: string; defaultEmoji?: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Ajouter une économie',
      defaultEmoji: DEFAULT_GOAL_EMOJI_SAVINGS,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const target = Math.max(0, parseEurosToNumber(totalStr));
        const apiName = `${emoji || DEFAULT_GOAL_EMOJI_SAVINGS} ${label.trim()}`.trim();
        store.emitAction('createProject', { name: apiName, target });
      },
    });
  }

  private openEditDrawer({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    if (!project) return;
    const parsed = splitLeadingEmoji({
      label: project.name,
      defaultIcon: DEFAULT_GOAL_EMOJI_SAVINGS,
    });
    const drawer = document.getElementById('goal-edit-drawer') as HTMLElement & {
      open: (o: { title?: string; initialLabel: string; initialTotal: string; initialEmoji?: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Mettre à jour l\'objectif',
      initialLabel: parsed.text || project.name,
      initialTotal: formatEuros(parseFloat(String(project.target)) || 0),
      initialEmoji: parsed.icon,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const detail: UpdateProjectActionDetail = {
          projectId,
          name: `${emoji || parsed.icon || DEFAULT_GOAL_EMOJI_SAVINGS} ${label.trim()}`.trim(),
          target: Math.max(0, parseEurosToNumber(totalStr)),
        };
        store.emitAction('updateProject', detail);
      },
    });
  }

  private rollback({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const detail: ProjectByIdActionDetail = { projectId };
    store.emitAction('rollbackProject', detail);
  }

  private reApply({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const detail: ProjectByIdActionDetail = { projectId };
    store.emitAction('reApplyProject', detail);
  }

  private confirmDelete({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    const label = project?.name ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Voulez-vous vraiment supprimer l'objectif « ${label} » ?`,
      onConfirm: () => {
        const detail: ProjectByIdActionDetail = { projectId };
        store.emitAction('deleteProject', detail);
      },
      onCancel: () => {},
    });
  }

  private confirmDeleteVictory({ projectId }: { projectId: string }): void {
    const store = this._store;
    if (!store) return;
    const project = this.getProjectById({ projectId });
    const label = project?.name ?? '';
    const modal = document.getElementById('delete-confirm-modal') as BuddjConfirmModalElement;
    modal?.show({
      title: `Supprimer « ${label} » (objectif atteint) ?`,
      onConfirm: () => {
        const detail: ProjectByIdActionDetail = { projectId };
        store.emitAction('deleteProject', detail);
      },
      onCancel: () => {},
    });
  }

  private showToast(message: string, variant: 'success' | 'warning' | 'error' = 'success'): void {
    const toast = getToast();
    toast?.show({ message, variant });
  }
}

customElements.define(BuddjScreenSavings.tagName, BuddjScreenSavings);
