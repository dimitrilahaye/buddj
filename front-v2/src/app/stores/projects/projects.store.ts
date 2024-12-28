import { computed, Injectable, Signal, signal } from '@angular/core';
import { Project } from '../../models/project.model';
import ProjectStoreInterface from './projects.store.interface';
import { Category } from '../../services/projects/projects.service.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectStore implements ProjectStoreInterface {
  private readonly _allSaving = signal<Project[] | null>(null);
  private readonly _allRefund = signal<Project[] | null>(null);

  getAllByCategory(category: Category): Signal<Project[] | null> {
    return computed(() => {
      return category === 'refund' ? this._allRefund() : this._allSaving();
    });
  }

  replace(project: Project): void {
    const all =
      project.category === 'refund' ? this._allRefund : this._allSaving;
    all.update((projects) => {
      if (projects === null) {
        return [project];
      }
      const filteredProjects = projects.filter((p) => p.id !== project.id);
      return [...filteredProjects, project];
    });
  }

  remove(project: Project): void {
    const all =
      project.category === 'refund' ? this._allRefund : this._allSaving;
    all.update((projects) => {
      if (projects === null) {
        return null;
      }
      const filteredProjects = projects.filter((p) => p.id !== project.id);
      return [...filteredProjects];
    });
  }

  add(project: Project): void {
    const all =
      project.category === 'refund' ? this._allRefund : this._allSaving;
    all.update((projects) => {
      if (projects === null) {
        return null;
      }
      return [...projects, project];
    });
  }

  addAll(projects: Project[], category: Category): void {
    const all = category === 'refund' ? this._allRefund : this._allSaving;
    all.update(() => {
      return projects;
    });
  }
}
