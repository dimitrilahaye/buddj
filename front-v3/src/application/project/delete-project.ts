import type { ProjectService } from './project-service.js';

export type DeleteProjectUseCase = (input: { projectId: string }) => Promise<void>;

export function createDeleteProject({
  projectService,
}: {
  projectService: ProjectService;
}): DeleteProjectUseCase {
  return ({ projectId }) => projectService.remove({ projectId });
}
