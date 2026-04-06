import type { ProjectCategory, ProjectView } from './project-view.js';

export interface ProjectService {
  getAllByCategory(input: { category: ProjectCategory }): Promise<ProjectView[]>;
  create(input: { name: string; target: number; category: ProjectCategory }): Promise<ProjectView>;
  update(input: { projectId: string; name?: string; target?: number }): Promise<ProjectView>;
  addAmount(input: { projectId: string; amount: number }): Promise<ProjectView>;
  rollback(input: { projectId: string }): Promise<ProjectView>;
  reApply(input: { projectId: string }): Promise<ProjectView>;
  remove(input: { projectId: string }): Promise<void>;
}
