import { Store } from '../store.js';
import type { AddAmountToProjectUseCase } from './add-amount-to-project.js';
import type { CreateProjectUseCase } from './create-project.js';
import type { DeleteProjectUseCase } from './delete-project.js';
import type { LoadProjectsByCategoryUseCase } from './load-projects-by-category.js';
import type { ProjectCategory, ProjectView } from './project-view.js';
import { sortProjectsByName } from './project-view.js';
import type { ReApplyProjectUseCase } from './re-apply-project.js';
import type { RollbackProjectUseCase } from './rollback-project.js';
import type { UpdateProjectUseCase } from './update-project.js';

export type ProjectsState = {
  category: ProjectCategory;
  projects: ProjectView[];
  isLoading: boolean;
  loadErrorMessage: string | null;
  busy: boolean;
};

export type CreateProjectActionDetail = {
  name: string;
  target: number;
};

export type UpdateProjectActionDetail = {
  projectId: string;
  name?: string;
  target?: number;
};

export type AddAmountActionDetail = {
  projectId: string;
  amount: number;
};

export type ProjectByIdActionDetail = {
  projectId: string;
};

export class ProjectsStore extends Store<ProjectsState> {
  private readonly _loadProjectsByCategory: LoadProjectsByCategoryUseCase;
  private readonly _createProject: CreateProjectUseCase;
  private readonly _updateProject: UpdateProjectUseCase;
  private readonly _addAmountToProject: AddAmountToProjectUseCase;
  private readonly _rollbackProject: RollbackProjectUseCase;
  private readonly _reApplyProject: ReApplyProjectUseCase;
  private readonly _deleteProject: DeleteProjectUseCase;

  constructor({
    category,
    loadProjectsByCategory,
    createProject,
    updateProject,
    addAmountToProject,
    rollbackProject,
    reApplyProject,
    deleteProject,
  }: {
    category: ProjectCategory;
    loadProjectsByCategory: LoadProjectsByCategoryUseCase;
    createProject: CreateProjectUseCase;
    updateProject: UpdateProjectUseCase;
    addAmountToProject: AddAmountToProjectUseCase;
    rollbackProject: RollbackProjectUseCase;
    reApplyProject: ReApplyProjectUseCase;
    deleteProject: DeleteProjectUseCase;
  }) {
    super({
      category,
      projects: [],
      isLoading: false,
      loadErrorMessage: null,
      busy: false,
    });
    this._loadProjectsByCategory = loadProjectsByCategory;
    this._createProject = createProject;
    this._updateProject = updateProject;
    this._addAmountToProject = addAmountToProject;
    this._rollbackProject = rollbackProject;
    this._reApplyProject = reApplyProject;
    this._deleteProject = deleteProject;

    this.addEventListener('loadProjects', () => void this.handleLoad());
    this.addEventListener('createProject', (e: Event) => {
      const detail = (e as CustomEvent<CreateProjectActionDetail>).detail;
      if (detail?.name?.trim() && detail.target > 0) void this.handleCreate({ detail });
    });
    this.addEventListener('updateProject', (e: Event) => {
      const detail = (e as CustomEvent<UpdateProjectActionDetail>).detail;
      if (!detail?.projectId) return;
      void this.handleUpdate({ detail });
    });
    this.addEventListener('addAmountToProject', (e: Event) => {
      const detail = (e as CustomEvent<AddAmountActionDetail>).detail;
      if (detail?.projectId && detail.amount > 0) void this.handleAddAmount({ detail });
    });
    this.addEventListener('rollbackProject', (e: Event) => {
      const detail = (e as CustomEvent<ProjectByIdActionDetail>).detail;
      if (detail?.projectId) void this.handleRollback({ detail });
    });
    this.addEventListener('reApplyProject', (e: Event) => {
      const detail = (e as CustomEvent<ProjectByIdActionDetail>).detail;
      if (detail?.projectId) void this.handleReApply({ detail });
    });
    this.addEventListener('deleteProject', (e: Event) => {
      const detail = (e as CustomEvent<ProjectByIdActionDetail>).detail;
      if (detail?.projectId) void this.handleDelete({ detail });
    });
  }

  private notifyStateUpdated(): void {
    this.emitStateChange('projectsStateUpdated');
  }

  private setBusy({ busy }: { busy: boolean }): void {
    this.setState({ busy });
    this.notifyStateUpdated();
  }

  private upsertProject({ project }: { project: ProjectView }): void {
    const current = this.getState().projects.filter((item) => item.id !== project.id);
    const projects = sortProjectsByName({ projects: [...current, project] });
    this.setState({ projects });
    this.notifyStateUpdated();
  }

  private removeProjectFromState({ projectId }: { projectId: string }): void {
    const projects = this.getState().projects.filter((item) => item.id !== projectId);
    this.setState({ projects: sortProjectsByName({ projects }) });
    this.notifyStateUpdated();
  }

  private async handleLoad(): Promise<void> {
    if (this.getState().isLoading) return;
    this.setState({ isLoading: true, loadErrorMessage: null });
    this.emitStateChange('projectsLoading');
    this.notifyStateUpdated();
    try {
      const projects = await this._loadProjectsByCategory({
        category: this.getState().category,
      });
      this.setState({
        projects: sortProjectsByName({ projects }),
        isLoading: false,
        loadErrorMessage: null,
      });
      this.emitStateChange('projectsLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.setState({ isLoading: false, loadErrorMessage: message });
      this.emitStateChange('projectsLoadFailed', { message });
    }
    this.notifyStateUpdated();
  }

  private async handleCreate({ detail }: { detail: CreateProjectActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectCreateLoading');
    try {
      const project = await this._createProject({
        name: detail.name.trim(),
        target: detail.target,
        category: this.getState().category,
      });
      this.upsertProject({ project });
      this.emitStateChange('projectCreateLoaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectCreateFailed', { message });
    } finally {
      this.setBusy({ busy: false });
    }
  }

  private async handleUpdate({ detail }: { detail: UpdateProjectActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectUpdateLoading', { projectId: detail.projectId });
    try {
      const project = await this._updateProject({
        projectId: detail.projectId,
        name: detail.name,
        target: detail.target,
      });
      this.upsertProject({ project });
      this.emitStateChange('projectUpdateLoaded', { projectId: detail.projectId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectUpdateFailed', { projectId: detail.projectId, message });
    } finally {
      this.setBusy({ busy: false });
    }
  }

  private async handleAddAmount({ detail }: { detail: AddAmountActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectAddAmountLoading', { projectId: detail.projectId });
    try {
      const project = await this._addAmountToProject({
        projectId: detail.projectId,
        amount: detail.amount,
      });
      this.upsertProject({ project });
      this.emitStateChange('projectAddAmountLoaded', { projectId: detail.projectId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectAddAmountFailed', {
        projectId: detail.projectId,
        message,
      });
    } finally {
      this.setBusy({ busy: false });
    }
  }

  private async handleRollback({ detail }: { detail: ProjectByIdActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectRollbackLoading', { projectId: detail.projectId });
    try {
      const project = await this._rollbackProject({ projectId: detail.projectId });
      this.upsertProject({ project });
      this.emitStateChange('projectRollbackLoaded', { projectId: detail.projectId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectRollbackFailed', { projectId: detail.projectId, message });
    } finally {
      this.setBusy({ busy: false });
    }
  }

  private async handleReApply({ detail }: { detail: ProjectByIdActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectReApplyLoading', { projectId: detail.projectId });
    try {
      const project = await this._reApplyProject({ projectId: detail.projectId });
      this.upsertProject({ project });
      this.emitStateChange('projectReApplyLoaded', { projectId: detail.projectId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectReApplyFailed', { projectId: detail.projectId, message });
    } finally {
      this.setBusy({ busy: false });
    }
  }

  private async handleDelete({ detail }: { detail: ProjectByIdActionDetail }): Promise<void> {
    if (this.getState().busy) return;
    this.setBusy({ busy: true });
    this.emitStateChange('projectDeleteLoading', { projectId: detail.projectId });
    try {
      await this._deleteProject({ projectId: detail.projectId });
      this.removeProjectFromState({ projectId: detail.projectId });
      this.emitStateChange('projectDeleteLoaded', { projectId: detail.projectId });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.emitStateChange('projectDeleteFailed', { projectId: detail.projectId, message });
    } finally {
      this.setBusy({ busy: false });
    }
  }
}
