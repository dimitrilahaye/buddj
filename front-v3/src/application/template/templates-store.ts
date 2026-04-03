import { Store } from '../store.js';
import type { AddTemplateBudgetUseCase } from './add-template-budget.js';
import type { AddTemplateOutflowUseCase } from './add-template-outflow.js';
import type { DeleteTemplateBudgetUseCase } from './delete-template-budget.js';
import type { DeleteTemplateOutflowUseCase } from './delete-template-outflow.js';
import type { LoadTemplatesUseCase } from './load-templates.js';
import type { TemplateView } from './template-view.js';
import type { UpdateTemplateUseCase } from './update-template.js';

export type TemplatesState = {
  templates: TemplateView[];
  isLoading: boolean;
  loadErrorMessage: string | null;
  busyTemplateId: string | null;
};

const DEFAULT_STATE: TemplatesState = {
  templates: [],
  isLoading: false,
  loadErrorMessage: null,
  busyTemplateId: null,
};

export type LoadTemplatesActionDetail = Record<string, never>;
export type UpdateTemplateActionDetail = { templateId: string; name: string; isDefault: boolean };
export type AddTemplateOutflowActionDetail = { templateId: string; label: string; amount: number };
export type DeleteTemplateOutflowActionDetail = { templateId: string; outflowId: string };
export type AddTemplateBudgetActionDetail = { templateId: string; name: string; initialBalance: number };
export type DeleteTemplateBudgetActionDetail = { templateId: string; budgetId: string };

/**
 * Liste et mutations des templates mensuels (API /months/template, /monthly-templates/…).
 */
export class TemplatesStore extends Store<TemplatesState> {
  constructor({
    loadTemplates,
    updateTemplate,
    addTemplateOutflow,
    deleteTemplateOutflow,
    addTemplateBudget,
    deleteTemplateBudget,
  }: {
    loadTemplates: LoadTemplatesUseCase;
    updateTemplate: UpdateTemplateUseCase;
    addTemplateOutflow: AddTemplateOutflowUseCase;
    deleteTemplateOutflow: DeleteTemplateOutflowUseCase;
    addTemplateBudget: AddTemplateBudgetUseCase;
    deleteTemplateBudget: DeleteTemplateBudgetUseCase;
  }) {
    super(DEFAULT_STATE);
    this._loadTemplates = loadTemplates;
    this._updateTemplate = updateTemplate;
    this._addTemplateOutflow = addTemplateOutflow;
    this._deleteTemplateOutflow = deleteTemplateOutflow;
    this._addTemplateBudget = addTemplateBudget;
    this._deleteTemplateBudget = deleteTemplateBudget;

    this.addEventListener('loadTemplates', () => void this.handleLoadTemplates());
    this.addEventListener('updateTemplate', (e: Event) => {
      const d = (e as CustomEvent<UpdateTemplateActionDetail>).detail;
      if (d?.templateId) void this.handleUpdateTemplate(d);
    });
    this.addEventListener('addTemplateOutflow', (e: Event) => {
      const d = (e as CustomEvent<AddTemplateOutflowActionDetail>).detail;
      if (d?.templateId && d.label?.trim() && d.amount !== undefined && d.amount > 0) void this.handleAddOutflow(d);
    });
    this.addEventListener('deleteTemplateOutflow', (e: Event) => {
      const d = (e as CustomEvent<DeleteTemplateOutflowActionDetail>).detail;
      if (d?.templateId && d.outflowId) void this.handleDeleteOutflow(d);
    });
    this.addEventListener('addTemplateBudget', (e: Event) => {
      const d = (e as CustomEvent<AddTemplateBudgetActionDetail>).detail;
      if (d?.templateId && d.name?.trim() && d.initialBalance !== undefined && d.initialBalance > 0) {
        void this.handleAddBudget(d);
      }
    });
    this.addEventListener('deleteTemplateBudget', (e: Event) => {
      const d = (e as CustomEvent<DeleteTemplateBudgetActionDetail>).detail;
      if (d?.templateId && d.budgetId) void this.handleDeleteBudget(d);
    });
  }

  private _loadTemplates: LoadTemplatesUseCase;
  private _updateTemplate: UpdateTemplateUseCase;
  private _addTemplateOutflow: AddTemplateOutflowUseCase;
  private _deleteTemplateOutflow: DeleteTemplateOutflowUseCase;
  private _addTemplateBudget: AddTemplateBudgetUseCase;
  private _deleteTemplateBudget: DeleteTemplateBudgetUseCase;

  private _replaceTemplateInList(updated: TemplateView): void {
    const { templates } = this.getState();
    const idx = templates.findIndex((t) => t.id === updated.id);
    if (idx < 0) return;
    let next = templates.map((t, i) => (i === idx ? updated : t));
    if (updated.isDefault) {
      next = next.map((t) => ({ ...t, isDefault: t.id === updated.id }));
    }
    this.setState({ templates: next });
    this.emitStateChange('templatesStateUpdated');
  }

  private async handleLoadTemplates(): Promise<void> {
    if (this.getState().isLoading) return;
    this.setState({ isLoading: true, loadErrorMessage: null });
    this.emitStateChange('templatesLoading');
    this.emitStateChange('templatesStateUpdated');
    try {
      const templates = await this._loadTemplates();
      this.setState({ templates, isLoading: false, loadErrorMessage: null });
      this.emitStateChange('templatesLoaded');
      this.emitStateChange('templatesStateUpdated');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
      this.emitStateChange('templatesLoadFailed', { message });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  private async handleUpdateTemplate(detail: UpdateTemplateActionDetail): Promise<void> {
    const { templateId } = detail;
    if (this.getState().busyTemplateId) return;
    this.setState({ busyTemplateId: templateId });
    this.emitStateChange('templateUpdateLoading', { templateId });
    try {
      const updated = await this._updateTemplate(detail);
      this._replaceTemplateInList(updated);
      this.emitStateChange('templateUpdateLoaded', { templateId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('templateUpdateFailed', { message });
    } finally {
      this.setState({ busyTemplateId: null });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  private async handleAddOutflow(detail: AddTemplateOutflowActionDetail): Promise<void> {
    const { templateId } = detail;
    if (this.getState().busyTemplateId) return;
    this.setState({ busyTemplateId: templateId });
    this.emitStateChange('templateOutflowAddLoading', { templateId });
    try {
      const updated = await this._addTemplateOutflow(detail);
      this._replaceTemplateInList(updated);
      this.emitStateChange('templateOutflowAddLoaded', { templateId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('templateOutflowAddFailed', { message });
    } finally {
      this.setState({ busyTemplateId: null });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  private async handleDeleteOutflow(detail: DeleteTemplateOutflowActionDetail): Promise<void> {
    const { templateId } = detail;
    if (this.getState().busyTemplateId) return;
    this.setState({ busyTemplateId: templateId });
    this.emitStateChange('templateOutflowDeleteLoading', { templateId });
    try {
      const updated = await this._deleteTemplateOutflow(detail);
      this._replaceTemplateInList(updated);
      this.emitStateChange('templateOutflowDeleteLoaded', { templateId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('templateOutflowDeleteFailed', { message });
    } finally {
      this.setState({ busyTemplateId: null });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  private async handleAddBudget(detail: AddTemplateBudgetActionDetail): Promise<void> {
    const { templateId } = detail;
    if (this.getState().busyTemplateId) return;
    this.setState({ busyTemplateId: templateId });
    this.emitStateChange('templateBudgetAddLoading', { templateId });
    try {
      const updated = await this._addTemplateBudget(detail);
      this._replaceTemplateInList(updated);
      this.emitStateChange('templateBudgetAddLoaded', { templateId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('templateBudgetAddFailed', { message });
    } finally {
      this.setState({ busyTemplateId: null });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  private async handleDeleteBudget(detail: DeleteTemplateBudgetActionDetail): Promise<void> {
    const { templateId } = detail;
    if (this.getState().busyTemplateId) return;
    this.setState({ busyTemplateId: templateId });
    this.emitStateChange('templateBudgetDeleteLoading', { templateId });
    try {
      const updated = await this._deleteTemplateBudget(detail);
      this._replaceTemplateInList(updated);
      this.emitStateChange('templateBudgetDeleteLoaded', { templateId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('templateBudgetDeleteFailed', { message });
    } finally {
      this.setState({ busyTemplateId: null });
      this.emitStateChange('templatesStateUpdated');
    }
  }

  getTemplateById(id: string): TemplateView | undefined {
    return this.getState().templates.find((t) => t.id === id);
  }
}
