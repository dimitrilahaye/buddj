import type { ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type AddAmountToProjectUseCase = (input: {
  projectId: string;
  amount: number;
}) => Promise<ProjectView>;

export function createAddAmountToProject({
  projectService,
}: {
  projectService: ProjectService;
}): AddAmountToProjectUseCase {
  return ({ projectId, amount }) => projectService.addAmount({ projectId, amount });
}
