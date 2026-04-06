/**
 * Écran Remboursements : dépenses à se rembourser (ex. concert 200€ pris sur l’épargne).
 * Même structure que Économies : buddj-goal-card (style budget-card), total restant sticky, actions et dropdown.
 */
import type { ProjectView } from '../../application/project/project-view.js';
import type {
  AddAmountActionDetail,
  ProjectByIdActionDetail,
  UpdateProjectActionDetail,
} from '../../application/project/projects-store.js';
import type { ReimbursementsStore } from '../../application/project/reimbursements-store.js';
import type { BuddjConfirmModalElement } from '../molecules/buddj-confirm-modal.js';
import type { GoalDrawerOnValidate } from '../organisms/buddj-goal-add-drawer.js';
import type { BuddjGoalAmountDrawerElement } from '../organisms/buddj-goal-amount-drawer.js';
import { getToast } from '../atoms/buddj-toast.js';
import { escapeAttr, escapeHtml } from '../../shared/escape.js';
import { splitLeadingEmoji } from '../../shared/emoji-label.js';
import {
  DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
  formatEuros,
  parseEurosToNumber,
} from '../../shared/goal.js';

export class BuddjScreenReimbursements extends HTMLElement {
  static readonly tagName = 'buddj-screen-reimbursements';

  private _store?: ReimbursementsStore;
  private _listenersAttached = false;

  init({ reimbursementsStore }: { reimbursementsStore: ReimbursementsStore }): void {
    this._store = reimbursementsStore;
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
  };

  private _onStoreError = ((e: Event) => {
    const detail = (e as CustomEvent<{ message?: string }>).detail;
    this.showToast(detail?.message ?? 'Une erreur est survenue.');
  }) as EventListener;

  private _onCreateLoaded = ((): void => {
    this.showToast('Votre remboursement a été crée !');
  }) as EventListener;

  private _onUpdateLoaded = ((): void => {
    this.showToast('Votre remboursement a bien été modifié !');
  }) as EventListener;

  private _onAddAmountLoaded = ((): void => {
    this.showToast('Votre montant a bien été ajouté !');
  }) as EventListener;

  private _onHistoryUpdated = ((): void => {
    this.showToast("L'historique a bien été mis à jour !");
  }) as EventListener;

  private _onDeleteLoaded = ((): void => {
    this.showToast('Votre remboursement a bien été supprimé !');
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
          defaultIcon: DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
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
      ${isLoading ? '<p class="goal-loading">Chargement…</p>' : ''}
      ${loadErrorMessage ? `<p class="goal-error" role="alert">${escapeHtml(loadErrorMessage)}</p>` : ''}
      <section class="goal-section">
        <div class="goal-section-header">
          <buddj-btn-add label="Ajouter un remboursement" title="Ajouter un remboursement" data-goal-add-btn></buddj-btn-add>
        </div>
        <div class="goal-list" aria-label="Liste des remboursements" role="list">
          ${listHtml}
        </div>
        ${projects.length === 0 && !isLoading ? '<p class="goal-empty">Aucun remboursement pour l\'instant.</p>' : ''}
      </section>
    `;
    this.innerHTML = '';
    this.appendChild(main);
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
    }) as EventListener);
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
      title: 'Ajouter un remboursement',
      defaultEmoji: DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const target = Math.max(0, parseEurosToNumber(totalStr));
        const apiName = `${emoji || DEFAULT_GOAL_EMOJI_REIMBURSEMENT} ${label.trim()}`.trim();
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
      defaultIcon: DEFAULT_GOAL_EMOJI_REIMBURSEMENT,
    });
    const drawer = document.getElementById('goal-edit-drawer') as HTMLElement & {
      open: (o: { title?: string; initialLabel: string; initialTotal: string; initialEmoji?: string; onValidate: GoalDrawerOnValidate }) => void;
    };
    drawer?.open({
      title: 'Mettre à jour le remboursement',
      initialLabel: parsed.text || project.name,
      initialTotal: formatEuros(parseFloat(String(project.target)) || 0),
      initialEmoji: parsed.icon,
      onValidate: (label: string, totalStr: string, emoji: string) => {
        const detail: UpdateProjectActionDetail = {
          projectId,
          name: `${emoji || parsed.icon || DEFAULT_GOAL_EMOJI_REIMBURSEMENT} ${label.trim()}`.trim(),
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
      title: `Voulez-vous vraiment supprimer le remboursement « ${label} » ?`,
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
      title: `Supprimer « ${label} » (remboursement terminé) ?`,
      onConfirm: () => {
        const detail: ProjectByIdActionDetail = { projectId };
        store.emitAction('deleteProject', detail);
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
