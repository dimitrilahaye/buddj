import { describe, expect, it } from 'vitest';
import { sortProjectsByName, type ProjectView } from '../../src/application/project/project-view.js';

function project(input: { id: string; name: string }): ProjectView {
  return {
    id: input.id,
    name: input.name,
    target: 100,
    totalAmount: 0,
    canRollback: true,
    canReApply: false,
    canFinish: false,
    category: 'saving',
  };
}

describe('sortProjectsByName', () => {
  it('trie par nom sans emoji de tête', () => {
    const sorted = sortProjectsByName({
      projects: [
        project({ id: '1', name: '🏥 Hôpital' }),
        project({ id: '2', name: '📆 Fin février' }),
        project({ id: '3', name: '🚗 Midas' }),
      ],
    });
    expect(sorted.map((p) => p.name)).toEqual(['📆 Fin février', '🏥 Hôpital', '🚗 Midas']);
  });
});
