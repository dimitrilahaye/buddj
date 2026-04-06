import type { ProjectCategory, ProjectView } from './project-view.js';
import type { ProjectService } from './project-service.js';

export type LoadProjectsByCategoryUseCase = (input: { category: ProjectCategory }) => Promise<ProjectView[]>;

export function createLoadProjectsByCategory({
  projectService,
}: {
  projectService: ProjectService;
}): LoadProjectsByCategoryUseCase {
  return ({ category }) => projectService.getAllByCategory({ category });
}
