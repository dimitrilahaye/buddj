export type ProjectCategory = 'saving' | 'refund';

export interface ProjectView {
  id: string;
  name: string;
  target: number;
  totalAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
  category: ProjectCategory;
}

export function sortProjectsByName({ projects }: { projects: ProjectView[] }): ProjectView[] {
  return [...projects].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
