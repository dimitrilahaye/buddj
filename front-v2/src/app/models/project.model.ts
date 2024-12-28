import { Category } from '../services/projects/projects.service.interface';

interface Project {
  id: string;
  name: string;
  target: number;
  totalAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
  category: Category;
}

export type { Project };
