interface Project {
  id: string;
  name: string;
  target: number;
  leftAmount: number;
  canRollback: boolean;
  canReApply: boolean;
  canFinish: boolean;
}

export type { Project };
