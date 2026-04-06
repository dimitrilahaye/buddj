import type { ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type RollbackProjectUseCase = (input: { projectId: string }) => Promise<ProjectView>;

export function createRollbackProject({
  projectService,
}: {
  projectService: ProjectService;
}): RollbackProjectUseCase {
  return ({ projectId }) => projectService.rollback({ projectId });
}
