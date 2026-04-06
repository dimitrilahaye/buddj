import type { AddAmountToProjectUseCase } from './add-amount-to-project.js';
import type { CreateProjectUseCase } from './create-project.js';
import type { DeleteProjectUseCase } from './delete-project.js';
import type { LoadProjectsByCategoryUseCase } from './load-projects-by-category.js';
import { ProjectsStore } from './projects-store.js';
import type { ReApplyProjectUseCase } from './re-apply-project.js';
import type { RollbackProjectUseCase } from './rollback-project.js';
import type { UpdateProjectUseCase } from './update-project.js';

export class SavingsStore extends ProjectsStore {
  constructor({
    loadProjectsByCategory,
    createProject,
    updateProject,
    addAmountToProject,
    rollbackProject,
    reApplyProject,
    deleteProject,
  }: {
    loadProjectsByCategory: LoadProjectsByCategoryUseCase;
    createProject: CreateProjectUseCase;
    updateProject: UpdateProjectUseCase;
    addAmountToProject: AddAmountToProjectUseCase;
    rollbackProject: RollbackProjectUseCase;
    reApplyProject: ReApplyProjectUseCase;
    deleteProject: DeleteProjectUseCase;
  }) {
    super({
      category: 'saving',
      loadProjectsByCategory,
      createProject,
      updateProject,
      addAmountToProject,
      rollbackProject,
      reApplyProject,
      deleteProject,
    });
  }
}
