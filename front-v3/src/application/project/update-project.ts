import type { ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type UpdateProjectUseCase = (input: {
  projectId: string;
  name?: string;
  target?: number;
}) => Promise<ProjectView>;

export function createUpdateProject({
  projectService,
}: {
  projectService: ProjectService;
}): UpdateProjectUseCase {
  return ({ projectId, name, target }) => projectService.update({ projectId, name, target });
}
