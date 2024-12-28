import { InjectionToken, Signal } from '@angular/core';
import { Project } from '../../models/project.model';
import { Category } from '../../services/projects/projects.service.interface';

export default interface ProjectStoreInterface {
  replace(project: Project): void;
  remove(project: Project): void;
  add(project: Project): void;
  addAll(projects: Project[], category: Category): void;
  getAllByCategory(category: Category): Signal<Project[] | null>;
}

export const PROJECT_STORE = new InjectionToken<ProjectStoreInterface>(
  'PROJECT_STORE'
);
