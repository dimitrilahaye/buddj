import { splitLeadingEmoji } from '../../shared/emoji-label.js';

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
  return [...projects].sort((a, b) => {
    const labelA = splitLeadingEmoji({ label: a.name, defaultIcon: '' }).text || a.name;
    const labelB = splitLeadingEmoji({ label: b.name, defaultIcon: '' }).text || b.name;
    return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
  });
}
