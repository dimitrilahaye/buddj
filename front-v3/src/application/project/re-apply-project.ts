import type { ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type ReApplyProjectUseCase = (input: { projectId: string }) => Promise<ProjectView>;

export function createReApplyProject({
  projectService,
}: {
  projectService: ProjectService;
}): ReApplyProjectUseCase {
  return ({ projectId }) => projectService.reApply({ projectId });
}
