import type { ProjectCategory, ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type CreateProjectUseCase = (input: {
  name: string;
  target: number;
  category: ProjectCategory;
}) => Promise<ProjectView>;

export function createCreateProject({
  projectService,
}: {
  projectService: ProjectService;
}): CreateProjectUseCase {
  return ({ name, target, category }) => projectService.create({ name, target, category });
}
